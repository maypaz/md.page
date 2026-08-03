import { Hono } from "hono";
import { cors } from "hono/cors";
import MarkdownIt from "markdown-it";
import type { Env, PageData } from "./types";
import { generateId, extractMeta, emit, escapeHtml } from "./utils";
import { FAVICON_SVG, CLAUDE_LOGO_SVG, CURSOR_LOGO_SVG, OPENCLAW_LOGO_SVG, NANOCLAW_LOGO_SVG, LOGO_SVG, OG_IMAGE_PNG_B64 } from "./assets";
import { renderOgPng, renderLandingOgPng } from "./og";
import { pageTemplate, expiredPageHtml, landingPageHtml, apiDocsPageHtml, privacyPageHtml } from "./templates";
import { agentReady, LANDING_PAGE_MARKDOWN } from "./agent-ready";

export { generateId, escapeHtml, stripMarkdownInline, extractMeta } from "./utils";
export { wrapText, parseMarkdownBlocks, generateOgSvg } from "./og";

type HonoEnv = { Bindings: Env };

const app = new Hono<HonoEnv>();
const md = new MarkdownIt({ html: false });

const defaultFence = md.renderer.rules.fence!;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  if (token.info.trim().toLowerCase() === "mermaid") {
    return `<pre class="mermaid">${escapeHtml(token.content)}</pre>\n`;
  }
  return defaultFence(tokens, idx, options, env, self);
};

const TTL = 86400; // 24 hours
const OG_IMAGE_FALLBACK = Uint8Array.from(atob(OG_IMAGE_PNG_B64), c => c.charCodeAt(0));

// Global error handler — always return structured JSON errors
app.onError((err, c) => {
  return c.json({
    error: "INTERNAL_ERROR",
    message: "An unexpected error occurred",
    hint: "Try again later. If the problem persists, check https://md.page/docs for API usage.",
    documentation_url: "https://md.page/docs",
    retry_after: 5,
  }, 500, {
    "Retry-After": "5",
  });
});

// Catch-all 404 — always return structured JSON
app.notFound((c) => {
  return c.json({
    error: "NOT_FOUND",
    message: "The requested resource was not found",
    hint: "Check the API documentation at https://md.page/docs or the OpenAPI spec at https://md.page/openapi.json.",
    documentation_url: "https://md.page/docs",
    available_endpoints: {
      publish: "POST /api/publish",
      openapi: "GET /openapi.json",
      llms_txt: "GET /llms.txt",
      pages: "GET/POST https://md.page/api/pages (hosted service)",
      keys: "GET/POST https://md.page/api/keys (hosted service)",
    },
  }, 404);
});

// Accounts, permanent pages, and API keys are served by the hosted md.page.
// Answer these routes with a pointer so clients and agents get redirected
// instead of a bare 404.
const HOSTED_ORIGIN = "https://md.page";
for (const path of ["/api/me", "/api/keys", "/api/keys/*", "/api/pages", "/api/pages/*"]) {
  app.all(path, (c) => {
    const target = `${HOSTED_ORIGIN}${new URL(c.req.url).pathname}`;
    return c.json({
      error: "HOSTED_SERVICE_ONLY",
      message: "Accounts, permanent pages, and API keys are provided by the hosted md.page service",
      hint: `Call this endpoint on the hosted service instead: ${target} (Authorization: Bearer mdp_...). Anonymous publishing works here via POST /api/publish.`,
      documentation_url: "https://md.page/docs",
      hosted_endpoint: target,
    }, 404);
  });
}
app.get("/login", (c) => c.redirect(`${HOSTED_ORIGIN}/login`, 302));

// CORS for API routes
app.use("/api/*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// POST /api/event — client-side event tracking
app.post("/api/event", async (c) => {
  try {
    const body = await c.req.json<{ event: string; ref?: string }>();
    const allowed = ["github_click", "copy_prompt_click", "copy_skill_claude", "copy_skill_openclaw", "copy_mcp", "copy_api_curl", "try_it_cta_click", "try_publish"];
    if (body.event && allowed.includes(body.event)) {
      // The beacon's own Referer is always our page — use the client-reported
      // document.referrer instead so acquisition data reflects the real source.
      const ref = typeof body.ref === "string" ? body.ref.slice(0, 256) : "";
      emit(c.env, body.event, "", c.req.raw, { ref });
    }
  } catch {
    // ignore
  }
  return c.text("ok");
});

// GET /api/publish — method not allowed
app.get("/api/publish", (c) => {
  return c.json({
    error: "METHOD_NOT_ALLOWED",
    message: "Use POST to publish markdown",
    hint: "Send a POST request with Content-Type: application/json and body {\"markdown\": \"...\"}.",
    documentation_url: "https://md.page/openapi.json",
  }, 405, { "Allow": "POST" });
});

// POST /api/publish — create a page
// Worker-level rate limiting: short-window edge/WAF rules can miss slow-paced
// floods, so a 60s counting window backs them up. Bindings are optional so
// local dev still works.
app.post("/api/publish", async (c) => {
  if (c.env.PUBLISH_LIMITER) {
    const ip = c.req.header("CF-Connecting-IP") ?? "unknown";
    const { success } = await c.env.PUBLISH_LIMITER.limit({ key: ip });
    if (!success) {
      emit(c.env, "publish_rate_limited", "per_ip", c.req.raw);
      return c.json({
        error: "RATE_LIMITED",
        message: "Too many publishes from this IP",
        hint: "Wait a minute and try again.",
      }, 429, { "Retry-After": "60" });
    }
  }

  // Soft global cap — same key for every request so they share a counter.
  if (c.env.PUBLISH_GLOBAL_LIMITER) {
    const { success } = await c.env.PUBLISH_GLOBAL_LIMITER.limit({ key: "global" });
    if (!success) {
      emit(c.env, "publish_rate_limited", "global", c.req.raw);
      return c.json({
        error: "RATE_LIMITED",
        message: "Service is temporarily over capacity",
        hint: "Try again in a minute.",
      }, 429, { "Retry-After": "60" });
    }
  }

  try {
    const body = await c.req.json<{ markdown: string }>();

    if (!body.markdown || typeof body.markdown !== "string") {
      return c.json({ error: "MISSING_FIELD", message: "Missing 'markdown' field", hint: "Include a 'markdown' string field in your JSON request body.", documentation_url: "https://md.page/openapi.json" }, 400);
    }

    if (body.markdown.length > 500_000) {
      return c.json({ error: "CONTENT_TOO_LARGE", message: "Content too large (max 500KB)", hint: "Reduce your markdown content to under 500,000 characters. Current size: " + body.markdown.length + " characters.", documentation_url: "https://md.page/openapi.json" }, 413);
    }

    const id = generateId();
    const url = new URL(c.req.url);
    const expiresAt = new Date(Date.now() + TTL * 1000).toISOString();
    const meta = extractMeta(body.markdown);
    const renderedHtml = md.render(body.markdown);

    const markdownPreview = body.markdown.slice(0, 1500);
    await c.env.PAGES.put(id, JSON.stringify({ html: renderedHtml, title: meta.title, description: meta.description, markdownPreview }), { expirationTtl: TTL });

    const pageUrl = `${url.origin}/${id}`;

    emit(c.env, "page_publish", "", c.req.raw);

    return c.json({ url: pageUrl, expires_at: expiresAt }, 201);
  } catch {
    return c.json({ error: "INVALID_JSON", message: "Invalid JSON body", hint: "Send a valid JSON object with Content-Type: application/json." }, 400);
  }
});

// SVG assets
const svgAssets: Record<string, string> = {
  "/favicon.svg": FAVICON_SVG,
  "/claude-logo.svg": CLAUDE_LOGO_SVG,
  "/cursor-logo.svg": CURSOR_LOGO_SVG,
  "/openclaw-logo.svg": OPENCLAW_LOGO_SVG,
  "/nanoclaw-logo.svg": NANOCLAW_LOGO_SVG,
  "/logo.svg": LOGO_SVG,
};
for (const [path, svg] of Object.entries(svgAssets)) {
  app.get(path, (c) => {
    return c.body(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
  });
}

// Landing page video (served from R2; bucket is optional for self-hosts)
app.get("/lp.mp4", async (c) => {
  if (!c.env.ASSETS_BUCKET) return c.text("Not found", 404);
  const object = await c.env.ASSETS_BUCKET.get("lp.mp4");
  if (!object) return c.text("Not found", 404);
  return c.body(object.body as ReadableStream, { headers: { "Content-Type": "video/mp4", "Cache-Control": "public, max-age=86400" } });
});

// OG image (PNG for WhatsApp/social)
app.get("/og-image.png", async (c) => {
  try {
    const pngData = await renderLandingOgPng();
    return new Response(pngData, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
  } catch {
    const bytes = OG_IMAGE_FALLBACK;
    return new Response(bytes, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
  }
});

// Dynamic OG image per page
app.get("/og/:filename", async (c) => {
  const filename = c.req.param("filename");
  const match = filename.match(/^([a-zA-Z0-9]{6})\.png$/);
  if (!match) return c.text("Not found", 404);
  const id = match[1];

  const stored = await c.env.PAGES.get(id);
  if (!stored) {
    const bytes = OG_IMAGE_FALLBACK;
    return new Response(bytes, { status: 404, headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
  }
  const page = JSON.parse(stored) as PageData;
  try {
    const pngData = await renderOgPng(page.title || "md.page", page.markdownPreview || page.description || "");
    return new Response(pngData, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("OG image render failed");
    const bytes = OG_IMAGE_FALLBACK;
    return new Response(bytes, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
  }
});

// Agent-readiness routes (robots.txt, sitemap, .well-known/*)
app.route("", agentReady);

// Landing page markdown at /index.md
app.get("/index.md", (c) => {
  return c.text(LANDING_PAGE_MARKDOWN, 200, {
    "Content-Type": "text/markdown; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
  });
});

// Landing page
app.get("/", (c) => {
  const url = new URL(c.req.url);
  emit(c.env, "homepage_visit", "", c.req.raw);

  // ?mode=agent — structured JSON for AI agents
  if (url.searchParams.get("mode") === "agent") {
    return c.json({
      name: "md.page",
      description: "Instantly convert Markdown to a shareable HTML page.",
      url: url.origin,
      api: {
        publish: { method: "POST", url: `${url.origin}/api/publish`, auth: "none", body: { markdown: "string (required)" }, response: { url: "string", expires_at: "string (ISO 8601)" } },
        pages: { method: "POST/GET/PUT/DELETE", url: "https://md.page/api/pages", auth: "Bearer <api-key>", note: "hosted service" },
        keys: { method: "POST/GET", url: "https://md.page/api/keys", auth: "Bearer <api-key>", note: "hosted service" },
      },
      auth: { anonymous: "No auth required for POST /api/publish", authenticated: "Google OAuth sign-in at https://md.page, then use API keys (Authorization: Bearer mdp_...)" },
      capabilities: ["Markdown to HTML", "Shareable URLs", "24h anonymous pages", "Permanent pages with subdomains (hosted service)", "Mermaid diagrams", "OG images", "MCP server", "REST API"],
      integrations: { mcp: "npx -y mdpage-mcp", skill: "npx skills add maypaz/md.page", openapi: `${url.origin}/openapi.json` },
      links: { docs: `${url.origin}/docs`, privacy: `${url.origin}/privacy`, github: "https://github.com/maypaz/md.page", llms_txt: `${url.origin}/llms.txt` },
    }, 200, { "Cache-Control": "public, max-age=3600" });
  }

  // Markdown content negotiation
  const accept = c.req.header("accept") || "";
  if (accept.includes("text/markdown")) {
    return c.text(LANDING_PAGE_MARKDOWN, 200, {
      "Content-Type": "text/markdown; charset=utf-8",
    });
  }

  // Link headers for agent discovery (RFC 8288 / RFC 9727)
  return c.html(landingPageHtml(url.origin), 200, {
    "Link": `</.well-known/api-catalog>; rel="api-catalog", </docs>; rel="service-doc", </.well-known/mcp/server-card.json>; rel="describedby", </llms.txt>; rel="alternate"; type="text/plain", </AGENTS.md>; rel="alternate"; type="text/markdown", </.well-known/agent.json>; rel="alternate"; type="application/json", </openapi.json>; rel="service-desc"; type="application/openapi+json"`,
  });
});

// Privacy policy
app.get("/privacy", (c) => {
  const url = new URL(c.req.url);
  return c.html(privacyPageHtml(url.origin));
});

app.get("/docs", (c) => {
  const url = new URL(c.req.url);
  return c.html(apiDocsPageHtml(url.origin));
});

// GET /:id — serve a published page
app.get("/:id{[a-zA-Z0-9]{6}}", async (c) => {
  const id = c.req.param("id");
  const url = new URL(c.req.url);
  const stored = await c.env.PAGES.get(id);

  if (!stored) {
    return c.html(expiredPageHtml(), 404, { "X-Robots-Tag": "noindex" });
  }

  const page = JSON.parse(stored) as PageData;
  const pageUrl = `${url.origin}/${id}`;
  const ogImageUrl = `${url.origin}/og/${id}.png`;
  const html = pageTemplate(page.html, { title: page.title, description: page.description, pageUrl, origin: url.origin, ogImageUrl, ogType: "article" });

  emit(c.env, "page_view", id, c.req.raw);

  return c.html(html, 200, {
    "X-Robots-Tag": "noindex",
    "Cache-Control": "no-store",
  });
});

export default {
  fetch: app.fetch,
};
