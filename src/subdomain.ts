import { Hono } from "hono";
import type { Env, PageData } from "./types";
import { getUserFromCookie } from "./auth";
import { pageTemplate, docsPageHtml, docViewPageHtml, editorPageHtml, settingsPageHtml } from "./templates";
import { emit } from "./utils";

type HonoEnv = { Bindings: Env };

/** Extracts username from subdomain, e.g. "alice.md.page" → "alice" */
export function extractSubdomain(host: string): string | null {
  // Match: username.md.page or username.md.page:port
  const match = host.match(/^([a-z0-9][a-z0-9-]*[a-z0-9])\.md\.page(:\d+)?$/);
  if (!match) return null;
  return match[1];
}

export const subdomainApp = new Hono<HonoEnv>();

// --- Owner dashboard: GET / -------------------------------------------------

subdomainApp.get("/", async (c) => {
  const username = c.req.header("x-subdomain-user")!;
  const currentUser = await getUserFromCookie(c.env.DB, c.req.header("cookie") ?? null);

  // Owner viewing their dashboard
  if (currentUser && currentUser.username === username) {
    const url = new URL(c.req.url);
    const { results: pages } = await c.env.DB.prepare(
      "SELECT id, slug, visibility, updated_at FROM pages WHERE user_id = ? ORDER BY updated_at DESC"
    ).bind(currentUser.id).all<{ id: string; slug: string; visibility: string; updated_at: string }>();

    return c.html(docsPageHtml({
      user: currentUser,
      pages,
      origin: url.origin,
    }));
  }

  // Not owner — redirect to landing
  return c.redirect("https://md.page", 302);
});

// --- Owner: new doc editor ---------------------------------------------------

subdomainApp.get("/new", async (c) => {
  const username = c.req.header("x-subdomain-user")!;
  const currentUser = await getUserFromCookie(c.env.DB, c.req.header("cookie") ?? null);
  if (!currentUser || currentUser.username !== username) {
    return c.redirect("https://md.page/login", 302);
  }

  const { results: pages } = await c.env.DB.prepare(
    "SELECT id, slug FROM pages WHERE user_id = ? ORDER BY updated_at DESC"
  ).bind(currentUser.id).all<{ id: string; slug: string }>();

  return c.html(editorPageHtml({
    user: currentUser,
    pages,
    origin: new URL(c.req.url).origin,
  }));
});

// --- Owner: settings ---------------------------------------------------------

subdomainApp.get("/settings", async (c) => {
  const username = c.req.header("x-subdomain-user")!;
  const currentUser = await getUserFromCookie(c.env.DB, c.req.header("cookie") ?? null);
  if (!currentUser || currentUser.username !== username) {
    return c.redirect("https://md.page/login", 302);
  }

  const url = new URL(c.req.url);
  const { results: pages } = await c.env.DB.prepare(
    "SELECT id, slug FROM pages WHERE user_id = ? ORDER BY updated_at DESC"
  ).bind(currentUser.id).all<{ id: string; slug: string }>();
  const { results: keys } = await c.env.DB.prepare(
    "SELECT id, label, last_used_at, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC"
  ).bind(currentUser.id).all<{ id: string; label: string | null; last_used_at: string | null; created_at: string }>();

  return c.html(settingsPageHtml({
    user: currentUser,
    pages,
    keys,
    origin: url.origin,
  }));
});

// --- Owner: edit doc ---------------------------------------------------------

subdomainApp.get("/:slug/edit", async (c) => {
  const username = c.req.header("x-subdomain-user")!;
  const slug = c.req.param("slug");
  const currentUser = await getUserFromCookie(c.env.DB, c.req.header("cookie") ?? null);
  if (!currentUser || currentUser.username !== username) {
    return c.redirect("https://md.page/login", 302);
  }

  const pageMeta = await c.env.DB.prepare("SELECT id, slug, visibility FROM pages WHERE slug = ? AND user_id = ?")
    .bind(slug, currentUser.id).first<{ id: string; slug: string; visibility: string }>();
  if (!pageMeta) return c.text("Page not found", 404);

  const { results: pages } = await c.env.DB.prepare(
    "SELECT id, slug FROM pages WHERE user_id = ? ORDER BY updated_at DESC"
  ).bind(currentUser.id).all<{ id: string; slug: string }>();

  const stored = await c.env.PAGES.get(pageMeta.id);
  const content = stored ? JSON.parse(stored) : { markdown: "" };

  return c.html(editorPageHtml({
    user: currentUser,
    pages,
    page: { ...pageMeta, markdown: content.markdown || "" },
    origin: new URL(c.req.url).origin,
  }));
});

// --- View page by slug (public or owner) -------------------------------------

subdomainApp.get("/:slug", async (c) => {
  const username = c.req.header("x-subdomain-user")!;
  const slug = c.req.param("slug");
  const url = new URL(c.req.url);

  const user = await c.env.DB.prepare("SELECT id FROM users WHERE username = ?")
    .bind(username).first<{ id: string }>();
  if (!user) return c.text("User not found", 404);

  const pageMeta = await c.env.DB.prepare(
    "SELECT id, visibility, view_count, revision_count, created_via, created_at, updated_at FROM pages WHERE user_id = ? AND slug = ?"
  ).bind(user.id, slug).first<{ id: string; visibility: string; view_count: number; revision_count: number; created_via: string; created_at: string; updated_at: string }>();
  if (!pageMeta) return c.text("Page not found", 404);

  const currentUser = await getUserFromCookie(c.env.DB, c.req.header("cookie") ?? null);
  const isOwner = currentUser && currentUser.username === username;

  // Check visibility
  if (pageMeta.visibility === "private" && !isOwner) {
    return c.text("This page is private", 403);
  }

  const stored = await c.env.PAGES.get(pageMeta.id);
  if (!stored) return c.text("Page content not found", 404);

  const page = JSON.parse(stored) as PageData;
  const pageUrl = `${url.origin}/${slug}`;
  const ogImageUrl = `https://md.page/og/${pageMeta.id}.png`;

  // Owner sees the page with dashboard chrome
  if (isOwner) {
    const { results: pages } = await c.env.DB.prepare(
      "SELECT id, slug FROM pages WHERE user_id = ? ORDER BY updated_at DESC"
    ).bind(currentUser.id).all<{ id: string; slug: string }>();

    return c.html(docViewPageHtml({
      user: currentUser,
      pages,
      page: {
        id: pageMeta.id, slug, visibility: pageMeta.visibility, renderedHtml: page.html,
        view_count: pageMeta.view_count, revision_count: pageMeta.revision_count,
        created_via: pageMeta.created_via, created_at: pageMeta.created_at, updated_at: pageMeta.updated_at,
      },
      origin: url.origin,
    }));
  }

  // Increment view count for non-owner views
  c.env.DB.prepare("UPDATE pages SET view_count = view_count + 1 WHERE id = ?")
    .bind(pageMeta.id).run().catch(() => {});

  // Public visitor — clean page, no dashboard
  const html = pageTemplate(page.html, {
    title: page.title,
    description: page.description,
    pageUrl,
    origin: url.origin,
    ogImageUrl,
    ogType: "article",
  });

  emit(c.env, "page_view", pageMeta.id);

  return c.html(html);
});
