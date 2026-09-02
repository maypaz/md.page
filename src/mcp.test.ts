import { describe, it, expect, beforeEach } from "vitest";
import { env, exports } from "cloudflare:workers";

// Raw JSON-RPC over streamable HTTP. The server is stateless (fresh
// McpServer per request), so each call stands alone — no session handshake
// state to thread between requests.

let rpcId = 0;
async function rpc(method: string, params: Record<string, unknown> = {}) {
  const res = await exports.default.fetch(
    new Request("https://md.page/mcp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
    }),
  );
  const ct = res.headers.get("Content-Type") ?? "";
  const text = await res.text();
  if (ct.includes("text/event-stream")) {
    const dataLines = text.split("\n").filter((l: string) => l.startsWith("data: "));
    return JSON.parse(dataLines[dataLines.length - 1].slice("data: ".length));
  }
  return JSON.parse(text);
}

const callTool = async (name: string, args: Record<string, unknown>) => {
  const msg = await rpc("tools/call", { name, arguments: args });
  expect(msg.error).toBeUndefined();
  return msg.result as { isError?: boolean; content: Array<{ type: string; text: string }> };
};

async function clearKV() {
  const list = await env.PAGES.list();
  await Promise.all(list.keys.map((k) => env.PAGES.delete(k.name)));
}

describe("MCP — protocol", () => {
  it("initialize handshake returns server info", async () => {
    const msg = await rpc("initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "test", version: "0.0.0" },
    });
    expect(msg.result.serverInfo.name).toBe("mdpage");
    expect(msg.result.capabilities.tools).toBeDefined();
    expect(msg.result.capabilities.resources).toBeDefined();
  });

  it("tools/list exposes publish_markdown with schema and MCP Apps metadata", async () => {
    const msg = await rpc("tools/list");
    const tools = msg.result.tools as Array<{ name: string; inputSchema: any; _meta?: any }>;
    expect(tools.map((t) => t.name)).toEqual(["publish_markdown"]);
    const publish = tools[0];
    expect(publish.inputSchema.required).toEqual(["markdown"]);
    expect(publish._meta?.ui?.resourceUri).toBe("ui://publish-markdown/app.html");
  });

  it("serves the MCP Apps UI resource", async () => {
    const listed = await rpc("resources/list");
    const uris = (listed.result.resources as Array<{ uri: string }>).map((r) => r.uri);
    expect(uris).toContain("ui://publish-markdown/app.html");

    const read = await rpc("resources/read", { uri: "ui://publish-markdown/app.html" });
    const content = read.result.contents[0];
    expect(content.text).toContain("app.ontoolresult");
    expect(content.mimeType).toContain("html");
  });

  it("rejects malformed JSON-RPC", async () => {
    const res = await exports.default.fetch(
      new Request("https://md.page/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
        body: "not json",
      }),
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("tolerates session-less GET (empty SSE stream) and DELETE", async () => {
    // Stateless transport: GET opens a standalone SSE channel that never
    // delivers anything, DELETE is a no-op — both 200, neither crashes.
    const get = await exports.default.fetch(
      new Request("https://md.page/mcp", { method: "GET", headers: { Accept: "application/json, text/event-stream" } }),
    );
    expect(get.status).toBe(200);
    expect(get.headers.get("Content-Type")).toContain("text/event-stream");
    const del = await exports.default.fetch(new Request("https://md.page/mcp", { method: "DELETE" }));
    expect(del.status).toBe(200);
  });

  it("OPTIONS preflight exposes MCP headers", async () => {
    const res = await exports.default.fetch(
      new Request("https://md.page/mcp", {
        method: "OPTIONS",
        headers: {
          Origin: "https://example.com",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type, Mcp-Session-Id",
        },
      }),
    );
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Mcp-Session-Id");
  });
});

describe("MCP — publish_markdown", () => {
  beforeEach(clearKV);

  it("publishes and returns the stdio-compatible result text", async () => {
    const result = await callTool("publish_markdown", { markdown: "# From MCP" });
    expect(result.isError).toBeFalsy();
    const text = result.content[0].text;
    const m = text.match(/^Published successfully!\n\nURL: https:\/\/md\.page\/([a-zA-Z0-9]{6})\nExpires: /);
    expect(m).not.toBeNull();
    // Dispatched through the real route: the page must actually exist in KV
    const stored = await env.PAGES.get(m![1]);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!).html).toContain("From MCP");
  });

  it("maps CONTENT_TOO_LARGE to the stdio 413 message", async () => {
    const result = await callTool("publish_markdown", { markdown: "x".repeat(500_001) });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Content too large. Maximum size is 500KB.");
  });

  it("rejects empty markdown via input schema", async () => {
    const msg = await rpc("tools/call", { name: "publish_markdown", arguments: { markdown: "" } });
    // zod min(1) → protocol-level invalid params or an isError result,
    // depending on SDK version; either way it must not publish.
    const failed = msg.error !== undefined || msg.result?.isError === true;
    expect(failed).toBe(true);
    const list = await env.PAGES.list();
    expect(list.keys.length).toBe(0);
  });
});
