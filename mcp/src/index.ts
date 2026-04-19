#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";

const BASE_URL = process.env.MDPAGE_URL?.replace(/\/+$/, "") || "https://md.page";

const server = new McpServer({
  name: "mdpage",
  version: "1.0.0",
});

interface PublishResponse {
  url: string;
  expires_at: string;
}

interface ErrorResponse {
  error: string;
}

// MCP Apps: UI resource for the publish tool
const publishResourceUri = "ui://publish-markdown/app.html";

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

// Register the publish tool with MCP Apps UI metadata
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
    try {
      const response = await fetch(`${BASE_URL}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });

      if (!response.ok) {
        let errorMessage: string;
        try {
          const error = (await response.json()) as ErrorResponse;
          const messages: Record<number, string> = {
            400: error.error || "Invalid markdown content.",
            413: "Content too large. Maximum size is 500KB.",
            429: "Rate limit exceeded. Try again later.",
          };
          errorMessage =
            messages[response.status] ||
            `Publishing failed: ${error.error || response.statusText}`;
        } catch {
          errorMessage = `Publishing failed (HTTP ${response.status}).`;
        }
        return {
          content: [{ type: "text" as const, text: errorMessage }],
          isError: true,
        };
      }

      let data: PublishResponse;
      try {
        data = (await response.json()) as PublishResponse;
      } catch {
        return {
          content: [
            {
              type: "text" as const,
              text: "Publishing succeeded but the response could not be parsed.",
            },
          ],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: `Published successfully!\n\nURL: ${data.url}\nExpires: ${data.expires_at}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to connect to md.page at ${BASE_URL}. ${error instanceof Error ? error.message : "Unknown error."}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Register the UI resource for the publish tool
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mdpage MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
