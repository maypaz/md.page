const RESERVED_USERNAMES = new Set([
  // Infrastructure & protocols
  "www", "www1", "www2", "www3", "api", "app", "cdn", "assets", "static",
  "mail", "smtp", "ftp", "sftp", "ssh", "dns", "ns1", "ns2", "ns3", "ns4",
  "mx", "pop", "pop3", "imap", "webmail", "email",
  "proxy", "redirect", "forward", "gateway", "relay", "tunnel",
  "cert", "certs", "certificate", "ssl", "tls", "acme",
  "vpn", "rdp", "telnet", "ntp", "ldap", "radius",

  // Auth & identity
  "admin", "administrator", "auth", "oauth", "sso", "saml", "openid",
  "login", "signin", "sign-in", "signup", "sign-up", "register",
  "logout", "signout", "sign-out", "password", "reset", "verify",
  "account", "accounts", "profile", "profiles", "me", "my", "self",
  "user", "users", "member", "members", "identity",
  "token", "tokens", "session", "sessions", "credentials",

  // App routes & features
  "dashboard", "home", "index", "landing", "welcome",
  "settings", "preferences", "options", "config", "configuration",
  "docs", "documentation", "doc", "help", "faq", "guide", "guides",
  "blog", "posts", "articles", "wiki", "knowledge", "kb",
  "support", "ticket", "tickets", "feedback", "report",
  "status", "uptime", "incidents", "outage", "maintenance",
  "billing", "invoice", "invoices", "payment", "payments", "subscribe",
  "pricing", "plans", "plan", "enterprise", "pro", "premium", "free", "trial",

  // Content actions
  "new", "create", "edit", "delete", "remove", "update", "publish",
  "draft", "drafts", "preview", "view", "read", "write",
  "upload", "uploads", "download", "downloads", "import", "export",
  "share", "shared", "embed", "widget", "widgets",

  // Resources
  "pages", "page", "posts", "post", "files", "file",
  "teams", "team", "orgs", "org", "organizations", "organization",
  "workspace", "workspaces", "project", "projects", "repo", "repos",
  "groups", "group", "channels", "channel", "rooms", "room",

  // Legal & compliance
  "privacy", "terms", "tos", "legal", "compliance", "dmca",
  "abuse", "report", "security", "vulnerability", "responsible-disclosure",
  "copyright", "trademark", "licenses", "license", "gdpr", "ccpa",

  // Discovery & social
  "search", "explore", "discover", "trending", "popular", "featured",
  "about", "contact", "info", "company", "careers", "jobs", "press",
  "news", "announcements", "changelog", "updates", "releases", "whats-new",
  "community", "forum", "forums", "discuss", "discussions",
  "follow", "followers", "following", "friends", "connections",

  // Commerce
  "marketplace", "store", "shop", "checkout", "pay", "cart",
  "order", "orders", "refund", "coupon", "coupons", "promo",

  // Notifications & messaging
  "notify", "notification", "notifications", "alerts", "alert",
  "inbox", "messages", "message", "chat", "dm", "direct",

  // Developer & API
  "graphql", "rest", "webhook", "webhooks", "callback", "callbacks",
  "sandbox", "playground", "console", "terminal", "shell", "cli",
  "sdk", "libraries", "integrations", "plugins", "extensions", "addons",
  "developer", "developers", "devs", "partners", "partner",

  // Monitoring & ops
  "analytics", "metrics", "monitor", "monitoring", "logs", "logging",
  "debug", "trace", "tracing", "health", "healthcheck", "healthz",
  "readyz", "livez", "ping", "pong", "heartbeat",
  "panel", "control", "manage", "management", "ops", "operations",

  // Storage & data
  "archive", "archived", "backup", "backups", "cache", "storage",
  "bucket", "buckets", "database", "db", "data", "export", "import",
  "media", "images", "image", "video", "videos", "audio",

  // System & reserved
  "public", "private", "internal", "external", "system", "root",
  "null", "undefined", "none", "void", "default", "localhost",
  "example", "examples", "sample", "samples", "demo", "demos",
  "test", "testing", "staging", "production", "prod", "dev", "development",
  "alpha", "beta", "canary", "nightly", "preview", "rc",
  "setup", "install", "uninstall", "onboarding",

  // Web standards
  "favicon", "robots", "sitemap", "manifest", "service-worker",
  "well-known", "apple-touch-icon", "browserconfig",
  "feed", "rss", "atom", "json-feed", "amp",

  // Brand protection
  "official", "verified", "staff", "moderator", "mod",
  "mdpage", "md-page", "markdown", "markdownpage",
]);

const MIN_LENGTH = 6;
const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const CONSECUTIVE_HYPHENS = /--/;
const PURELY_NUMERIC = /^[0-9]+$/;

export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${MIN_LENGTH} characters` };
  }

  if (!USERNAME_REGEX.test(username)) {
    return { valid: false, error: "Username must be lowercase alphanumeric with hyphens, no leading/trailing hyphens" };
  }

  if (CONSECUTIVE_HYPHENS.test(username)) {
    return { valid: false, error: "Username cannot contain consecutive hyphens" };
  }

  if (PURELY_NUMERIC.test(username)) {
    return { valid: false, error: "Username cannot be purely numeric" };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, error: "This username is reserved" };
  }

  return { valid: true };
}

const RESERVED_SLUGS = new Set([
  // Dashboard routes
  "new", "settings", "edit", "login", "logout",

  // API & auth paths
  "api", "auth", "oauth", "callback", "webhook", "webhooks",

  // App pages
  "dashboard", "home", "index", "admin", "account", "profile",
  "billing", "plan", "plans", "pricing", "upgrade",
  "docs", "help", "support", "faq", "guide",
  "search", "explore", "discover", "trending",
  "inbox", "notifications", "messages", "alerts",

  // Content actions
  "create", "delete", "remove", "update", "publish", "unpublish",
  "draft", "drafts", "preview", "import", "export",
  "upload", "download", "share", "embed",

  // Legal & info
  "privacy", "terms", "legal", "about", "contact", "dmca",
  "security", "abuse", "report", "copyright",

  // System
  "favicon", "robots", "sitemap", "manifest", "feed", "rss", "atom",
  "assets", "static", "public", "images", "media", "files",
  "well-known", "apple-touch-icon", "service-worker",
  "null", "undefined", "untitled", "default",
  "test", "debug", "health", "ping", "status",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}
