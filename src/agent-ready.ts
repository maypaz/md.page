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
        "service-desc": [{ href: `${origin}/openapi.json`, type: "application/json" }],
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

// --- /llms.txt — structured product description for LLMs ---

agentReady.get("/llms.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# md.page

> Instantly convert Markdown to a shareable HTML page.

md.page is a web service that turns Markdown content into clean, hosted HTML pages with shareable URLs. It offers both anonymous temporary pages (24-hour expiry, no signup) and permanent pages with custom subdomains for authenticated users.

## Use Cases

- Share formatted documentation, notes, or reports as web pages
- Publish markdown from AI agents, CLI tools, or scripts
- Create quick shareable links for code snippets, READMEs, or changelogs
- Host permanent documentation under a personal subdomain (username.md.page)

## Capabilities

- Converts Markdown to styled HTML with syntax highlighting
- Supports Mermaid diagrams
- Auto-generates Open Graph images for social sharing
- Provides MCP server for native AI agent integration
- Offers Claude Code skill and OpenClaw integration
- API key authentication for programmatic access to permanent pages

## Constraints

- Anonymous pages expire after 24 hours
- Maximum content size: 500KB per page
- Rate limited: 10 requests per 10 seconds per IP
- Permanent pages require Google OAuth sign-in
- Maximum 10 permanent pages per user

## API

### Anonymous Publishing (no auth required)

POST ${origin}/api/publish
Content-Type: application/json

{"markdown": "# Your content here"}

Response: {"url": "https://md.page/abc123", "expires_at": "..."}

### Authenticated API (requires API key)

- POST /api/pages — Create permanent page
- GET /api/pages — List your pages
- PUT /api/pages/:slug — Update a page
- DELETE /api/pages/:slug — Delete a page
- POST /api/keys — Create API key
- GET /api/keys — List API keys

Authorization: Bearer <api-key>

## Integration

- MCP Server: npx -y mdpage-mcp
- Claude Code Skill: npx skills add maypaz/md.page
- OpenAPI Spec: ${origin}/openapi.json
- API Documentation: ${origin}/docs

## Links

- Homepage: ${origin}
- API Docs: ${origin}/docs
- OpenAPI Spec: ${origin}/openapi.json
- GitHub: https://github.com/maypaz/md.page
- Privacy Policy: ${origin}/privacy
- Login: ${origin}/login
`;
  return c.text(body, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /llms-full.txt ---

agentReady.get("/llms-full.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# md.page — Full Documentation for LLMs

> Instantly convert Markdown to a shareable HTML page.

md.page is a web service that turns Markdown content into clean, hosted HTML pages with shareable URLs.

## Product Overview

md.page provides two tiers of service:

1. **Anonymous pages** — No signup required. POST markdown to /api/publish and get a shareable URL. Pages expire after 24 hours.
2. **Permanent pages** — Sign in with Google OAuth to get a personal subdomain (username.md.page). Create, update, and delete pages via authenticated API with API keys.

## API Reference

### POST /api/publish (Anonymous)

No authentication required. Creates a temporary page.

Request:
\`\`\`
POST ${origin}/api/publish
Content-Type: application/json

{"markdown": "# Hello World\\nYour markdown content here."}
\`\`\`

Response (201):
\`\`\`json
{"url": "https://md.page/abc123", "expires_at": "2026-04-20T12:00:00.000Z"}
\`\`\`

Errors:
- 400: Missing or invalid markdown field
- 413: Content too large (max 500KB)
- 429: Rate limit exceeded (10 req / 10s per IP)

### Authenticated Endpoints

All require \`Authorization: Bearer <api-key>\` header.

#### POST /api/pages — Create permanent page
Request body: {"markdown": "...", "slug": "optional-slug"}
Response: {"slug": "...", "url": "https://username.md.page/slug"}

#### GET /api/pages — List pages
Response: {"pages": [{"slug": "...", "title": "...", "updated_at": "..."}]}

#### PUT /api/pages/:slug — Update page
Request body: {"markdown": "..."}

#### DELETE /api/pages/:slug — Delete page

#### POST /api/keys — Create API key
Request body: {"name": "my-key"}
Response: {"key": "mdp_...", "name": "my-key"}

#### GET /api/keys — List API keys
Response: {"keys": [{"id": "...", "name": "...", "created_at": "..."}]}

## MCP Server

Install and configure the MCP server for AI agent integration:

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

Available tool: \`publish_markdown\` — publishes markdown and returns a shareable URL.

## Claude Code Skill

\`\`\`
npx skills add maypaz/md.page
\`\`\`

## Constraints

- Anonymous pages expire after 24 hours
- Maximum content size: 500KB
- Rate limit: 10 requests per 10 seconds per IP
- Permanent pages require Google OAuth authentication
- Maximum 10 permanent pages per user
- Supported markdown features: standard markdown, code blocks with syntax highlighting, Mermaid diagrams

## Links

- Homepage: ${origin}
- API Docs: ${origin}/docs
- OpenAPI Spec: ${origin}/openapi.json
- GitHub: https://github.com/maypaz/md.page
- Privacy: ${origin}/privacy
`;
  return c.text(body, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /openapi.json — OpenAPI 3.1 specification ---

agentReady.get("/openapi.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    openapi: "3.1.0",
    info: {
      title: "md.page API",
      version: "1.0.0",
      description: "Convert Markdown to shareable web pages. Publish any markdown content as a beautiful, hosted HTML page with a shareable URL.",
      contact: { url: "https://github.com/maypaz/md.page" },
      license: { name: "MIT", url: "https://github.com/maypaz/md.page/blob/main/LICENSE" },
    },
    servers: [{ url: origin, description: "Production" }],
    paths: {
      "/api/publish": {
        post: {
          operationId: "publishAnonymous",
          summary: "Publish anonymous page",
          description: "Create a temporary shareable page from markdown. No authentication required. Page expires after 24 hours.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["markdown"],
                  properties: {
                    markdown: { type: "string", minLength: 1, maxLength: 500000, description: "Markdown content to publish" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Page created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      url: { type: "string", format: "uri", description: "Shareable URL of the published page" },
                      expires_at: { type: "string", format: "date-time", description: "ISO 8601 expiration timestamp" },
                    },
                  },
                },
              },
            },
            "400": { description: "Invalid request — missing or invalid markdown field" },
            "413": { description: "Content too large — maximum 500KB" },
            "429": { description: "Rate limit exceeded — 10 requests per 10 seconds per IP" },
          },
        },
      },
      "/api/pages": {
        get: {
          operationId: "listPages",
          summary: "List permanent pages",
          description: "List all permanent pages for the authenticated user.",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "List of pages",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      pages: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            slug: { type: "string" },
                            title: { type: "string" },
                            updated_at: { type: "string", format: "date-time" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          operationId: "createPage",
          summary: "Create permanent page",
          description: "Create a permanent page under the authenticated user's subdomain.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["markdown"],
                  properties: {
                    markdown: { type: "string", minLength: 1, maxLength: 500000 },
                    slug: { type: "string", description: "Optional URL slug. Auto-generated from title if omitted." },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Page created" },
            "400": { description: "Invalid request" },
            "401": { description: "Unauthorized" },
            "409": { description: "Slug already exists" },
          },
        },
      },
      "/api/pages/{slug}": {
        put: {
          operationId: "updatePage",
          summary: "Update permanent page",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["markdown"],
                  properties: {
                    markdown: { type: "string", minLength: 1, maxLength: 500000 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Page updated" },
            "401": { description: "Unauthorized" },
            "404": { description: "Page not found" },
          },
        },
        delete: {
          operationId: "deletePage",
          summary: "Delete permanent page",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Page deleted" },
            "401": { description: "Unauthorized" },
            "404": { description: "Page not found" },
          },
        },
      },
      "/api/keys": {
        get: {
          operationId: "listKeys",
          summary: "List API keys",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "List of API keys" },
            "401": { description: "Unauthorized" },
          },
        },
        post: {
          operationId: "createKey",
          summary: "Create API key",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string", description: "Human-readable name for the key" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "API key created" },
            "401": { description: "Unauthorized" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key obtained from the md.page dashboard. Format: mdp_...",
        },
      },
    },
  }, 200, {
    "Content-Type": "application/json",
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
