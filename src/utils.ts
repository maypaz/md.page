import type { Env } from "./types";

const ID_LENGTH = 6;
const ID_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateId(): string {
  const bytes = new Uint8Array(ID_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ID_CHARS[b % ID_CHARS.length]).join("");
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function stripMarkdownInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .trim();
}

export function extractMeta(markdown: string): { title: string; description: string } {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? stripMarkdownInline(titleMatch[1]) : "md.page";
  const plainText = stripMarkdownInline(
    markdown
      .replace(/^#+\s+.+$/gm, "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/^\s*[-*+]\s/gm, "")
      .replace(/[>|#]/g, "")
      .replace(/\n+/g, " ")
  );
  const description = plainText.slice(0, 155) || "A page created with md.page";
  return { title, description };
}

// Referrer → normalized host for analytics. "direct" = no/unparseable referrer,
// "internal" = own host or any *.md.page. Never returns "" — empty blob3 marks
// pre-v2 rows, so acquisition queries can filter `blob3 != ''`.
export function normalizeReferrer(refUrl: string | null | undefined, ownHost: string): string {
  if (!refUrl) return "direct";
  try {
    const host = new URL(refUrl).hostname.toLowerCase().replace(/^www\./, "");
    if (!host) return "direct";
    const own = ownHost.toLowerCase().replace(/^www\./, "");
    if (host === own || host === "md.page" || host.endsWith(".md.page")) return "internal";
    return host;
  } catch {
    return "direct";
  }
}

// Coarse device class from User-Agent. "none" = header absent.
export function deviceClass(ua: string | null | undefined): string {
  if (!ua) return "none";
  if (/bot|crawl|spider|curl|wget|python|go-http|node|axios|httpie|slurp/i.test(ua)) return "bot";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android/i.test(ua)) return "mobile";
  return "desktop";
}

// FNV-1a 32-bit — cheap sync hash for the daily visitor id (crypto.subtle is
// async and emit must stay fire-and-forget).
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

// Daily visitor hash: 64 bits of FNV over UTC-date|IP|UA. The date acts as a
// daily-rotating salt — uniques are countable within a day, but visitors can't
// be tracked across days. Analytics-grade, not cryptographic.
export function visitorHash(req: Request): string {
  const ip = req.headers.get("CF-Connecting-IP") ?? "";
  const ua = req.headers.get("User-Agent") ?? "";
  if (!ip && !ua) return "";
  const s = new Date().toISOString().slice(0, 10) + "|" + ip + "|" + ua;
  return fnv1a(s).toString(16).padStart(8, "0") + fnv1a(s + "|2").toString(16).padStart(8, "0");
}

// v2 schema: blobs = [event, detail, referrer, country, device, username, vhash].
// opts.ref is a raw URL for client-reported referrers (/api/event beacons, whose
// own Referer header is always internal). opts.user is unused in the lite engine
// (no accounts) — kept for schema parity with the hosted service.
export function emit(
  env: Env,
  event: string,
  detail = "",
  req?: Request,
  opts?: { ref?: string; user?: string }
) {
  try {
    let ref = "";
    let country = "";
    let device = "";
    let vhash = "";
    if (req) {
      ref = normalizeReferrer(opts?.ref ?? req.headers.get("Referer"), new URL(req.url).hostname);
      country = (req.cf?.country as string | undefined) ?? "";
      device = deviceClass(req.headers.get("User-Agent"));
      vhash = visitorHash(req);
    }
    env.ANALYTICS?.writeDataPoint({
      blobs: [event, detail, ref, country, device, opts?.user ?? "", vhash],
      indexes: [event],
    });
  } catch {
    // Never break the request
  }
}
