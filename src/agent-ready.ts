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

# AI Search Crawlers — welcome to crawl public content
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

User-agent: Applebot-Extended
Allow: /

# AI Training Crawlers — allowed but distinguished from search
User-agent: CCBot
Allow: /
Disallow: /api/
Disallow: /auth/

User-agent: Bytespider
Allow: /
Disallow: /api/
Disallow: /auth/

Sitemap: ${origin}/sitemap.xml

# Content Signals (draft-romm-aipref-contentsignals)
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Content-Signal-For: CCBot; ai-train=yes, search=no
Content-Signal-For: Bytespider; ai-train=yes, search=no
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
  <url>
    <loc>${origin}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${origin}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${origin}/developers</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${origin}/openapi.json</loc>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
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
        anchor: `${origin}/.well-known/api-catalog`,
        item: [
          {
            href: `${origin}/openapi.json`,
            type: "application/openapi+json",
          },
        ],
      },
      {
        anchor: `${origin}/openapi.json`,
        "service-desc": [{ href: `${origin}/openapi.json`, type: "application/openapi+json" }],
        "service-doc": [{ href: `${origin}/docs`, type: "text/html" }],
        status: [{ href: `${origin}/`, type: "text/html" }],
      },
    ],
  }, 200, {
    "Content-Type": "application/linkset+json;profile=\"https://www.rfc-editor.org/info/rfc9727\"",
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

// --- /.well-known/agent-card.json (A2A Agent Card) ---

agentReady.get("/.well-known/agent-card.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    name: "md.page",
    description: "Convert Markdown to shareable web pages. Publish any markdown content as a beautiful, hosted HTML page with a shareable URL.",
    version: "1.0.0",
    url: origin,
    provider: { name: "md.page", url: origin },
    skills: [
      {
        name: "publish_markdown",
        description: "Publish markdown content as a temporary shareable web page (24h expiry). No authentication required.",
        endpoint: `${origin}/api/publish`,
        method: "POST",
        inputContentType: "application/json",
        outputContentType: "application/json",
      },
      {
        name: "manage_pages",
        description: "Create, list, update, and delete permanent pages under a personal subdomain. Requires API key authentication.",
        endpoint: `${origin}/api/pages`,
        method: "POST",
        inputContentType: "application/json",
        outputContentType: "application/json",
      },
    ],
    contactEndpoint: `${origin}/api/publish`,
    documentation: `${origin}/docs`,
    openapi: `${origin}/openapi.json`,
    authentication: {
      anonymous: { endpoints: ["/api/publish"], method: "none" },
      authenticated: { endpoints: ["/api/pages", "/api/keys"], method: "bearer", description: "API key (Authorization: Bearer mdp_...)" },
    },
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/ai-plugin.json (OpenAI plugin manifest) ---

agentReady.get("/.well-known/ai-plugin.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    schema_version: "v1",
    name_for_human: "md.page",
    name_for_model: "mdpage",
    description_for_human: "Convert Markdown to shareable web pages instantly.",
    description_for_model: "Publish markdown content as hosted HTML pages with shareable URLs. Use POST /api/publish with {\"markdown\": \"...\"} to create a temporary page (24h). No auth required for anonymous pages. Authenticated users get permanent pages with custom subdomains.",
    auth: { type: "none" },
    api: {
      type: "openapi",
      url: `${origin}/openapi.json`,
    },
    logo_url: `${origin}/favicon.svg`,
    contact_email: "support@md.page",
    legal_info_url: `${origin}/privacy`,
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/agent.json (agent discovery) ---

agentReady.get("/.well-known/agent.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    name: "md.page",
    description: "Convert Markdown to shareable web pages instantly.",
    when_to_use: [
      "When a user asks to share, publish, or host markdown as a web page",
      "When generating reports or documentation that needs a shareable URL",
      "When an AI agent needs to present formatted results as a readable web page",
      "When creating quick disposable shareable links (24h, no signup)",
      "When a developer needs a simple markdown-to-HTML hosting API",
    ],
    instructions: `POST ${origin}/api/publish with {"markdown": "..."} — returns {"url": "...", "expires_at": "..."}. No auth required.`,
    api: `${origin}/openapi.json`,
    mcp: "npx -y mdpage-mcp",
    docs: `${origin}/docs`,
    llms_txt: `${origin}/llms.txt`,
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /pricing.md ---

agentReady.get("/pricing.md", (c) => {
  const body = `# md.page Pricing

## Free Tier — Anonymous Pages

- No signup required
- POST markdown to /api/publish
- Pages expire after 24 hours
- Rate limit: 10 requests per 10 seconds per IP
- Max content size: 500KB per page
- Cost: **Free**

## Authenticated Tier — Permanent Pages

- Sign in with Google OAuth (free)
- Personal subdomain: username.md.page
- Create, update, and delete permanent pages
- API key access for programmatic use
- Up to 10 permanent pages per account
- Cost: **Free**

## Notes

- All features are currently free
- No credit card required
- No premium tier at this time
`;
  return c.text(body, 200, {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/mcp and /.well-known/mcp.json (serve content directly) ---

const mcpDiscoveryHandler = (c: any) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    name: "md.page",
    description: "Convert Markdown to shareable web pages. Publish any markdown content as a beautiful, hosted HTML page with a shareable URL.",
    version: "1.1.0",
    server_card: `${origin}/.well-known/mcp/server-card.json`,
    endpoint: "npx -y mdpage-mcp",
    documentation: `${origin}/docs`,
    openapi: `${origin}/openapi.json`,
    tools: ["publish_markdown"],
    install: { npm: "npx -y mdpage-mcp" },
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
};

agentReady.get("/.well-known/mcp", mcpDiscoveryHandler);
agentReady.get("/.well-known/mcp.json", mcpDiscoveryHandler);

// --- /.well-known/mcp/server-card.json (SEP-1649) ---

agentReady.get("/.well-known/mcp/server-card.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    serverInfo: {
      name: "md.page",
      version: "1.1.0",
      description: "Convert Markdown to shareable web pages. Publish any markdown content as a beautiful, hosted HTML page with a shareable URL.",
      instructions: "Use publish_markdown to convert markdown content into a shareable web page. No authentication required.",
    },
    serverUrl: `${origin}/.well-known/mcp/server-card.json`,
    endpoint: "npx -y mdpage-mcp",
    capabilities: {
      tools: [
        {
          name: "publish_markdown",
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
          _meta: {
            ui: {
              resourceUri: "ui://publish-markdown/app.html",
            },
          },
        },
      ],
      resources: [
        {
          uri: "ui://publish-markdown/app.html",
          name: "Publish Result",
          mimeType: "text/html; charset=utf-8; x-mcp-apps=true",
        },
      ],
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

## When to Use

- When a user asks to share, publish, or host markdown content as a web page
- When generating reports, documentation, or formatted output that needs a shareable URL
- When an AI agent needs to present results as a readable web page
- When converting markdown files to hosted HTML for collaboration
- When creating quick, disposable shareable links (24h expiry, no signup)
- When a developer needs a simple API for markdown-to-HTML hosting

## Agent Instructions

If you are an AI agent or LLM, here is how to use md.page:

1. To publish markdown as a shareable page, send a POST request to ${origin}/api/publish with Content-Type: application/json and body {"markdown": "<your content>"}.
2. The response includes a "url" field with the shareable link and an "expires_at" timestamp (24 hours from creation).
3. No authentication, API key, or signup is required for anonymous pages.
4. For permanent pages, the user must sign in with Google OAuth and create an API key at ${origin}/docs.
5. Use the MCP server (npx -y mdpage-mcp) for native tool integration, or the Claude Code skill (npx skills add maypaz/md.page).
6. Maximum content size is 500KB. Rate limit is 10 requests per 10 seconds per IP.

## Links

- Homepage: ${origin}
- Developer Portal: ${origin}/developers
- API Docs: ${origin}/docs
- OpenAPI Spec: ${origin}/openapi.json
- MCP Server Card: ${origin}/.well-known/mcp/server-card.json
- GitHub: https://github.com/maypaz/md.page
- Privacy Policy: ${origin}/privacy
- Login: ${origin}/login
`;
  return c.text(body, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /api/llms.txt — modular API-focused llms.txt ---

agentReady.get("/api/llms.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# md.page API

> Publish markdown as shareable web pages via a simple REST API.

## Anonymous Publishing (no auth required)

POST ${origin}/api/publish
Content-Type: application/json

{"markdown": "# Your content here"}

Response (201):
{"url": "https://md.page/abc123", "expires_at": "2026-04-20T12:00:00.000Z"}

Pages expire after 24 hours. Max size: 500KB. Rate limit: 10 req / 10s per IP.

## Authenticated API (requires API key)

Authorization: Bearer <api-key>

- POST /api/pages — Create permanent page (body: {"markdown": "...", "slug": "optional"})
- GET /api/pages — List your pages
- PUT /api/pages/:slug — Update a page
- DELETE /api/pages/:slug — Delete a page
- POST /api/keys — Create API key (body: {"name": "my-key"})
- GET /api/keys — List API keys

## Error Format

All API errors return JSON:
{"error": "ERROR_CODE", "message": "Human-readable description", "hint": "Suggested fix"}

## OpenAPI Spec

${origin}/openapi.json

## MCP Server

npx -y mdpage-mcp
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
- Developer Portal: ${origin}/developers
- API Docs: ${origin}/docs
- OpenAPI Spec: ${origin}/openapi.json
- MCP Server Card: ${origin}/.well-known/mcp/server-card.json
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
            "400": { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "413": { description: "Content too large", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "429": { description: "Rate limit exceeded", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
            "400": { description: "Invalid request", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "409": { description: "Slug already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { description: "Page not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          operationId: "deletePage",
          summary: "Delete permanent page",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Page deleted" },
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            "404": { description: "Page not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
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
            "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          required: ["error", "message"],
          properties: {
            error: { type: "string", description: "Machine-readable error code (e.g. MISSING_FIELD, UNAUTHORIZED)" },
            message: { type: "string", description: "Human-readable error description" },
            hint: { type: "string", description: "Suggested resolution or next step" },
          },
          example: {
            error: "MISSING_FIELD",
            message: "Missing 'markdown' field",
            hint: "Include a 'markdown' string field in your JSON request body.",
          },
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "API key obtained from the md.page dashboard. Format: mdp_...",
        },
      },
    },
  }, 200, {
    "Content-Type": "application/openapi+json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /developers — developer portal ---

agentReady.get("/developers", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    name: "md.page",
    description: "Markdown to shareable web pages — developer resources",
    api: {
      documentation: `${origin}/docs`,
      openapi_spec: `${origin}/openapi.json`,
      base_url: `${origin}/api`,
      authentication: {
        anonymous: "POST /api/publish requires no authentication",
        authenticated: "Bearer token via API key (Authorization: Bearer mdp_...)",
        oauth: "Google OAuth 2.0 for user sign-in",
      },
    },
    integrations: {
      mcp_server: {
        package: "mdpage-mcp",
        install: "npx -y mdpage-mcp",
        server_card: `${origin}/.well-known/mcp/server-card.json`,
        supports_mcp_apps: true,
      },
      claude_code_skill: {
        install: "npx skills add maypaz/md.page",
        registry: "https://skills.sh/maypaz/md.page/publish-to-mdpage",
      },
      cli: {
        package: "mdpage",
        install: "npx mdpage",
      },
    },
    discovery: {
      llms_txt: `${origin}/llms.txt`,
      llms_full_txt: `${origin}/llms-full.txt`,
      api_catalog: `${origin}/.well-known/api-catalog`,
      oauth_server: `${origin}/.well-known/oauth-authorization-server`,
      agent_skills: `${origin}/.well-known/agent-skills/index.json`,
      sitemap: `${origin}/sitemap.xml`,
      robots_txt: `${origin}/robots.txt`,
    },
    webhooks: {
      status: "not yet available",
      description: "Webhook support for page lifecycle events (create, update, delete) is planned.",
    },
    source_code: "https://github.com/maypaz/md.page",
    support: "https://github.com/maypaz/md.page/issues",
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /AGENTS.md — agent instruction file ---

agentReady.get("/AGENTS.md", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# AGENTS.md — md.page

## What is md.page?

md.page is a web service that converts Markdown content into clean, hosted HTML pages with shareable URLs.

## How to use md.page

To publish markdown as a shareable web page, send a POST request:

\`\`\`
POST ${origin}/api/publish
Content-Type: application/json

{"markdown": "# Your content here"}
\`\`\`

Response:
\`\`\`json
{"url": "https://md.page/abc123", "expires_at": "2026-04-20T12:00:00.000Z"}
\`\`\`

No authentication or API key is required. Pages expire after 24 hours.

## When to use

- When a user asks to share, publish, or host markdown as a web page
- When generating reports or documentation that needs a shareable URL
- When an AI agent needs to present formatted results as a readable web page
- When creating quick disposable shareable links (24h, no signup)

## API Reference

- OpenAPI spec: ${origin}/openapi.json
- Full docs: ${origin}/docs
- LLM context: ${origin}/llms.txt

## Integration options

- **MCP Server:** npx -y mdpage-mcp
- **Claude Code Skill:** npx skills add maypaz/md.page
- **REST API:** POST ${origin}/api/publish

## Authenticated API (permanent pages)

Users with Google OAuth sign-in get permanent pages at username.md.page.
Requires API key (Authorization: Bearer mdp_...).

- POST /api/pages — Create permanent page
- GET /api/pages — List pages
- PUT /api/pages/:slug — Update page
- DELETE /api/pages/:slug — Delete page

## Constraints

- Max content size: 500KB
- Rate limit: 10 requests per 10 seconds per IP
- Anonymous pages expire after 24 hours
- Max 10 permanent pages per authenticated user

## Contact

- GitHub: https://github.com/maypaz/md.page
- Support: https://github.com/maypaz/md.page/issues
`;
  return c.text(body, 200, {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/server-card.json (root-level alias) ---

agentReady.get("/.well-known/server-card.json", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    serverInfo: {
      name: "md.page",
      version: "1.1.0",
      description: "Convert Markdown to shareable web pages. Publish any markdown content as a beautiful, hosted HTML page with a shareable URL.",
      instructions: "Use publish_markdown to convert markdown content into a shareable web page. No authentication required.",
    },
    serverUrl: `${origin}/.well-known/mcp/server-card.json`,
    endpoint: "npx -y mdpage-mcp",
    capabilities: {
      tools: [
        {
          name: "publish_markdown",
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
          _meta: {
            ui: {
              resourceUri: "ui://publish-markdown/app.html",
            },
          },
        },
      ],
      resources: [
        {
          uri: "ui://publish-markdown/app.html",
          name: "Publish Result",
          mimeType: "text/html; charset=utf-8; x-mcp-apps=true",
        },
      ],
      prompts: [],
    },
  }, 200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /docs/llms.txt — modular docs-scoped llms.txt ---

agentReady.get("/docs/llms.txt", (c) => {
  const origin = new URL(c.req.url).origin;
  const body = `# md.page Documentation

> API documentation and developer resources for md.page.

## Sections

- [API Docs](${origin}/docs): Interactive API documentation with examples
- [OpenAPI Spec](${origin}/openapi.json): Machine-readable API specification (OpenAPI 3.1)
- [API llms.txt](${origin}/api/llms.txt): API-focused LLM context
- [Full llms.txt](${origin}/llms-full.txt): Complete product documentation for LLMs
- [Privacy Policy](${origin}/privacy): Data handling and privacy practices
- [Pricing](${origin}/pricing.md): Free tier details
`;
  return c.text(body, 200, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /.well-known/nlweb (NLWeb Schema Feed) ---

agentReady.get("/.well-known/nlweb", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.json({
    "@context": "https://schema.org",
    "@type": "DataFeed",
    name: "md.page NLWeb Feed",
    description: "NLWeb-compatible feed for md.page — a markdown to web page service",
    url: `${origin}/.well-known/nlweb`,
    provider: {
      "@type": "Organization",
      name: "md.page",
      url: origin,
    },
    dataFeedElement: [
      {
        "@type": "DataFeedItem",
        item: {
          "@type": "SoftwareApplication",
          name: "md.page",
          url: origin,
          description: "Instantly convert Markdown to a shareable HTML page. No signup required.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        },
      },
      {
        "@type": "DataFeedItem",
        item: {
          "@type": "WebAPI",
          name: "md.page API",
          url: `${origin}/api/publish`,
          documentation: `${origin}/openapi.json`,
          description: "REST API to publish markdown as shareable web pages. POST /api/publish with {\"markdown\": \"...\"} — no auth required.",
        },
      },
      {
        "@type": "DataFeedItem",
        item: {
          "@type": "WebPage",
          name: "md.page Documentation",
          url: `${origin}/docs`,
          description: "API documentation, developer resources, and integration guides for md.page.",
        },
      },
    ],
  }, 200, {
    "Content-Type": "application/ld+json",
    "Cache-Control": "public, max-age=3600",
  });
});

// --- /about — trust anchor page ---

agentReady.get("/about", (c) => {
  const origin = new URL(c.req.url).origin;
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About — md.page</title>
  <meta name="description" content="md.page is a web service that converts Markdown to shareable HTML pages.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="canonical" href="https://md.page/about">
  <link rel="alternate" hreflang="en" href="https://md.page/about">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fafafa; padding: 0 1rem 2rem; }
    .container { max-width: 640px; margin: 2rem auto; background: #fff; border-radius: 8px; padding: 2.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    h1 { font-size: 1.8rem; margin-bottom: 1rem; }
    h2 { font-size: 1.3rem; margin-top: 1.5em; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
    a { color: #059669; }
    ul { margin-left: 1.5rem; margin-bottom: 1em; }
    .back { display: inline-block; margin-bottom: 1rem; color: #6b7280; text-decoration: none; }
    .back:hover { color: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <a class="back" href="/">&larr; Home</a>
    <h1>About md.page</h1>
    <p>md.page is a web service that instantly converts Markdown into clean, shareable HTML pages. It was built to make publishing formatted content as simple as a single API call.</p>
    <h2>How it works</h2>
    <p>Send a POST request with your Markdown content to our API and receive a shareable URL in return. No signup or authentication is needed for temporary pages that last 24 hours.</p>
    <p>For permanent pages, sign in with Google to get your own subdomain (username.md.page) and manage your content through the dashboard or API.</p>
    <h2>Features</h2>
    <ul>
      <li>Anonymous 24-hour pages — no signup required</li>
      <li>Permanent pages with custom subdomains</li>
      <li>Syntax highlighting and Mermaid diagram support</li>
      <li>Auto-generated Open Graph images</li>
      <li>MCP server for AI agent integration</li>
      <li>REST API with OpenAPI specification</li>
    </ul>
    <h2>Open source</h2>
    <p>md.page is open source. View the code on <a href="https://github.com/maypaz/md.page">GitHub</a>.</p>
    <h2>Contact</h2>
    <p>For questions, feedback, or support, please open an issue on <a href="https://github.com/maypaz/md.page/issues">GitHub</a> or visit our <a href="/contact">contact page</a>.</p>
  </div>
</body>
</html>`, 200);
});

// --- /contact — trust anchor page ---

agentReady.get("/contact", (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact — md.page</title>
  <meta name="description" content="Get in touch with the md.page team.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="canonical" href="https://md.page/contact">
  <link rel="alternate" hreflang="en" href="https://md.page/contact">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fafafa; padding: 0 1rem 2rem; }
    .container { max-width: 640px; margin: 2rem auto; background: #fff; border-radius: 8px; padding: 2.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    h1 { font-size: 1.8rem; margin-bottom: 1rem; }
    h2 { font-size: 1.3rem; margin-top: 1.5em; margin-bottom: 0.5em; }
    p { margin-bottom: 1em; }
    a { color: #059669; }
    ul { margin-left: 1.5rem; margin-bottom: 1em; }
    .back { display: inline-block; margin-bottom: 1rem; color: #6b7280; text-decoration: none; }
    .back:hover { color: #059669; }
  </style>
</head>
<body>
  <div class="container">
    <a class="back" href="/">&larr; Home</a>
    <h1>Contact</h1>
    <p>We'd love to hear from you. Here's how to reach us:</p>
    <h2>Support & Bug Reports</h2>
    <p>For technical issues, feature requests, or bug reports, please open an issue on <a href="https://github.com/maypaz/md.page/issues">GitHub Issues</a>.</p>
    <h2>General Inquiries</h2>
    <p>For general questions or feedback, you can reach us at <a href="mailto:support@md.page">support@md.page</a>.</p>
    <h2>Links</h2>
    <ul>
      <li><a href="https://github.com/maypaz/md.page">GitHub Repository</a></li>
      <li><a href="/docs">API Documentation</a></li>
      <li><a href="/about">About md.page</a></li>
      <li><a href="/privacy">Privacy Policy</a></li>
    </ul>
  </div>
</body>
</html>`, 200);
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
