import { Hono } from "hono";
import type { Env } from "./types";

type HonoEnv = { Bindings: Env };

export const agentReady = new Hono<HonoEnv>();

// --- robots.txt (RFC 9309) + AI crawler rules + Content Signals ---

agentReady.get("/robots.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# https://md.page — Markdown to shareable web pages
User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /docs/edit/
Disallow: /docs/settings

# AI Crawlers — welcome to crawl public content
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: CCBot
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: ${origin}/sitemap.xml

# Content Signals (draft-romm-aipref-contentsignals)
Content-Signal: ai-train=yes, search=yes, ai-input=yes
`;
  return c.text(body, 200, { "Content-Type": "text/plain; charset=utf-8" });
});

// --- sitemap.xml ---

agentReady.get("/sitemap.xml", (c) => {
  const origin = new URL(c.req.url).origin;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${origin}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${origin}/docs</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${origin}/login</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${origin}/privacy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
  return c.body(xml, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/api-catalog (RFC 9727) ---

agentReady.get("/.well-known/api-catalog", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    linkset: [
      {
        anchor: `${origin}/api/publish`,
        "service-desc": [{ href: `${origin}/docs`, type: "text/html" }],
        "service-doc": [{ href: `${origin}/docs`, type: "text/html" }],
        status: [{ href: `${origin}/`, type: "text/html" }],
      },
    ],
  }, 200, {
    "Content-Type": "application/linkset+json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/oauth-authorization-server ---
// md.page delegates authentication to Google OAuth; describe that flow

agentReady.get("/.well-known/oauth-authorization-server", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    issuer: origin,
    authorization_endpoint: `${origin}/auth/google`,
    token_endpoint: "https://oauth2.googleapis.com/token",
    jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
    grant_types_supported: ["authorization_code"],
    response_types_supported: ["code"],
    scopes_supported: ["openid", "email", "profile"],
    service_documentation: `${origin}/docs`,
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/openid-configuration ---

agentReady.get("/.well-known/openid-configuration", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    issuer: origin,
    authorization_endpoint: `${origin}/auth/google`,
    token_endpoint: "https://oauth2.googleapis.com/token",
    userinfo_endpoint: "https://www.googleapis.com/oauth2/v2/userinfo",
    jwks_uri: "https://www.googleapis.com/oauth2/v3/certs",
    grant_types_supported: ["authorization_code"],
    response_types_supported: ["code"],
    scopes_supported: ["openid", "email", "profile"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/oauth-protected-resource (RFC 9728) ---

agentReady.get("/.well-known/oauth-protected-resource", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    resource: origin,
    authorization_servers: [origin],
    scopes_supported: ["openid", "email", "profile"],
    bearer_methods_supported: ["header"],
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/mcp/server-card.json (SEP-1649) ---

agentReady.get("/.well-known/mcp/server-card.json", (c) => {
  return c.json({
    serverInfo: {
      name: "md.page",
      version: "1.0.0",
      description: "Convert Markdown to shareable web pages. Publish any markdown content as a beautiful, hosted HTML page with a shareable URL.",
    },
    endpoint: "npx -y mdpage-mcp",
    capabilities: {
      tools: [
        {
          name: "publish",
          description: "Publish markdown content as a shareable web page. Returns a URL that expires in 24 hours.",
          inputSchema: {
            type: "object",
            properties: {
              markdown: {
                type: "string",
                description: "The markdown content to publish",
              },
            },
            required: ["markdown"],
          },
        },
      ],
      resources: [],
      prompts: [],
    },
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/agent-skills/index.json ---

agentReady.get("/.well-known/agent-skills/index.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "publish-to-mdpage",
        type: "skill-md",
        description: "Publish markdown content as a shareable web page via md.page",
        url: `${origin}/.well-known/agent-skills/publish-to-mdpage/SKILL.md`,
        digest: "sha256:0651272a716a5dd3e7e4f764b5122af891d2d0aa6c926130ed50ffb912e16170",
      },
    ],
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/agent-skills/publish-to-mdpage/SKILL.md ---

agentReady.get("/.well-known/agent-skills/publish-to-mdpage/SKILL.md", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# publish-to-mdpage

Publish any markdown content as a shareable web page via md.page.

## Usage

Send a POST request to \`${origin}/api/publish\` with a JSON body:

\`\`\`json
{
  "markdown": "# Your Markdown Here\\n\\nContent goes here."
}
\`\`\`

## Response

\`\`\`json
{
  "url": "https://md.page/abc123",
  "expires_at": "2026-04-20T12:00:00.000Z"
}
\`\`\`

Pages expire after 24 hours. For permanent pages, sign in and use the authenticated API.

## Install as Claude Code Skill

\`\`\`
npx skills add maypaz/md.page
\`\`\`

## MCP Server

\`\`\`json
{
  "mcpServers": {
    "mdpage": {
      "command": "npx",
      "args": ["-y", "mdpage-mcp"]
    }
  }
}
\`\`\`
`;
  return c.text(body, 200, {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- Landing page markdown representation (content negotiation) ---

export const LANDING_PAGE_MARKDOWN = `# md.page

Instantly convert Markdown to a shareable HTML page.

## What is md.page?

md.page turns your Markdown into a clean, hosted web page with one API call. No signup required for temporary pages (24h expiry). Sign in with Google for permanent pages with your own subdomain.

## Quick Start

### API

\`\`\`bash
curl -X POST https://md.page/api/publish \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# Hello World\\nYour content here."}'
\`\`\`

Returns:
\`\`\`json
{
  "url": "https://md.page/abc123",
  "expires_at": "2026-04-20T12:00:00.000Z"
}
\`\`\`

### MCP Server

\`\`\`json
{
  "mcpServers": {
    "mdpage": {
      "command": "npx",
      "args": ["-y", "mdpage-mcp"]
    }
  }
}
\`\`\`

### Claude Code Skill

\`\`\`
npx skills add maypaz/md.page
\`\`\`

## Features

- **Anonymous pages** — No signup, 24-hour expiry
- **Permanent pages** — Sign in with Google, get your own subdomain (username.md.page)
- **API keys** — Programmatic access for authenticated endpoints
- **Mermaid diagrams** — Built-in support
- **Open Graph images** — Auto-generated for social sharing
- **MCP server** — Native integration with AI agents

## Links

- [API Documentation](https://md.page/docs)
- [Privacy Policy](https://md.page/privacy)
- [Login](https://md.page/login)
- [GitHub](https://github.com/maypaz/md.page)
`;
