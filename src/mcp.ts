import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPTransport } from "@hono/mcp";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import type { Context } from "hono";
import type { Env } from "./types";
import { emit } from "./utils";

type HonoEnv = { Bindings: Env };

// ---------------------------------------------------------------------------
// Remote MCP server at /mcp (streamable HTTP, stateless per-request — no
// sessions, no Durable Objects). Two rules keep this honest:
//   1. Tools NEVER touch KV or publish logic directly — they dispatch through
//      the real routes via the injected `dispatch` (app.request), so every
//      call inherits the same rate limits, size checks, and analytics as a
//      plain curl.
//   2. The tool result text and error mapping mirror the stdio server
//      (mcp/src/index.ts) exactly — the MCP Apps HTML regex-parses that text.
// ---------------------------------------------------------------------------

export type Dispatch = (url: string, init?: RequestInit) => Promise<Response>;

// Forward the caller's network identity onto the synthetic request so per-IP
// rate limits and analytics context stay truthful.
function forwardHeaders(req: Request, extra: Record<string, string> = {}): Headers {
  const h = new Headers(extra);
  for (const name of ["CF-Connecting-IP", "CF-IPCountry", "User-Agent"]) {
    const v = req.headers.get(name);
    if (v) h.set(name, v);
  }
  return h;
}

// MCP Apps: UI resource for the publish tool
const publishResourceUri = "ui://publish-markdown/app.html";

// KEEP IN SYNC with PUBLISH_APP_HTML in mcp/src/index.ts (the stdio server).
// mcp/ is a standalone npm package excluded from this tsconfig, so the HTML
// is duplicated rather than imported.
const PUBLISH_APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>md.page — Published</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 20px; background: #f8f9fb; color: #1a1a1a; }
  .card { background: #fff; border-radius: 12px; padding: 24px; max-width: 480px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  h2 { font-size: 18px; margin-bottom: 12px; color: #059669; }
  .url { display: block; padding: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin: 12px 0; font-family: monospace; font-size: 14px; word-break: break-all; color: #065f46; text-decoration: none; }
  .url:hover { background: #dcfce7; }
  .meta { font-size: 13px; color: #6b7280; }
  .error { color: #dc2626; background: #fef2f2; border-color: #fecaca; }
  #status { margin-top: 8px; }
</style>
</head>
<body>
<div class="card">
  <h2>md.page</h2>
  <div id="status">Waiting for result...</div>
</div>
<script type="module">
  import { App } from "https://esm.sh/@modelcontextprotocol/ext-apps@1";
  const app = new App({ name: "md.page publish", version: "1.0.0" });
  const statusEl = document.getElementById("status");
  app.ontoolresult = (result) => {
    const text = result.content?.find(c => c.type === "text")?.text;
    if (!text) { statusEl.innerHTML = '<span class="error">No result</span>'; return; }
    if (result.isError) { statusEl.innerHTML = '<span class="error">' + text + '</span>'; return; }
    const urlMatch = text.match(/URL: (https:\\/\\/[^\\s]+)/);
    const expiresMatch = text.match(/Expires: (.+)/);
    if (urlMatch) {
      statusEl.innerHTML = '<a class="url" href="' + urlMatch[1] + '" target="_blank">' + urlMatch[1] + '</a>' +
        (expiresMatch ? '<div class="meta">Expires: ' + expiresMatch[1] + '</div>' : '');
    } else {
      statusEl.textContent = text;
    }
  };
  app.connect();
</script>
</body>
</html>`;

function buildServer(c: Context<HonoEnv>, dispatch: Dispatch) {
  const origin = new URL(c.req.url).origin;
  const server = new McpServer({ name: "mdpage", version: "1.0.0" });

  registerAppTool(
    server,
    "publish_markdown",
    {
      title: "Publish Markdown",
      description:
        "Publish markdown as a beautiful, shareable web page on md.page. Returns a short URL that expires in 24 hours. Use this whenever you need to share formatted content as a web page.",
      inputSchema: {
        markdown: z.string().min(1).describe("The markdown content to publish"),
      },
      _meta: { ui: { resourceUri: publishResourceUri } },
    },
    async ({ markdown }) => {
      emit(c.env, "mcp_tool", "publish_markdown", c.req.raw);
      const res = await dispatch(`${origin}/api/publish`, {
        method: "POST",
        headers: forwardHeaders(c.req.raw, { "Content-Type": "application/json" }),
        body: JSON.stringify({ markdown }),
      });

      // KEEP IN SYNC with the result-text and error mapping in
      // mcp/src/index.ts — the app HTML above regex-parses "URL: " and
      // "Expires: " out of the success text.
      if (res.status !== 201) {
        let errorMessage: string;
        try {
          const error = (await res.json()) as { error?: string };
          const messages: Record<number, string> = {
            400: error.error || "Invalid markdown content.",
            413: "Content too large. Maximum size is 500KB.",
            429: "Rate limit exceeded. Try again later.",
          };
          errorMessage =
            messages[res.status] ||
            `Publishing failed: ${error.error || res.statusText}`;
        } catch {
          errorMessage = `Publishing failed (HTTP ${res.status}).`;
        }
        return {
          content: [{ type: "text" as const, text: errorMessage }],
          isError: true,
        };
      }

      let data: { url: string; expires_at: string };
      try {
        data = (await res.json()) as { url: string; expires_at: string };
      } catch {
        return {
          content: [{ type: "text" as const, text: "Publishing succeeded but the response could not be parsed." }],
          isError: true,
        };
      }
      return {
        content: [{
          type: "text" as const,
          text: `Published successfully!\n\nURL: ${data.url}\nExpires: ${data.expires_at}`,
        }],
      };
    },
  );

  registerAppResource(
    server,
    "Publish Result",
    publishResourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [
        {
          uri: publishResourceUri,
          mimeType: RESOURCE_MIME_TYPE,
          text: PUBLISH_APP_HTML,
        },
      ],
    }),
  );

  return server;
}

// Fresh server + transport per request (stateless streamable HTTP).
export function createMcpHandler(dispatch: (c: Context<HonoEnv>) => Dispatch) {
  return async (c: Context<HonoEnv>) => {
    const server = buildServer(c, dispatch(c));
    const transport = new StreamableHTTPTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    const res = await transport.handleRequest(c);
    return res ?? c.text("MCP transport error", 500);
  };
}
