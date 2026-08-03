import { escapeHtml } from "./utils";
import { HERMES_LOGO_PNG_B64, BRAND_COLOR } from "./assets";
import type { TemplateOptions } from "./types";

export function pageTemplate(content: string, options: TemplateOptions = {}): string {
  const origin = options.origin || "https://md.page";
  const pageUrl = options.pageUrl || origin;
  const title = options.title || "md.page";
  const description = options.description || "Instantly convert Markdown to a shareable HTML page.";
  const ogImage = options.ogImageUrl || `${origin}/og-image.png`;
  const ogType = options.ogType || "website";
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}">
  <!-- Open Graph -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="md.page">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fafafa;
      padding: 0 1rem 2rem;
    }
    .container {
      max-width: 720px;
      margin: 2rem auto 0;
      background: #fff;
      border-radius: 8px;
      padding: 2.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }
    .container > h1:first-child { margin-top: 0; }
    h1 { font-size: 1.8rem; }
    h2 { font-size: 1.4rem; }
    h3 { font-size: 1.2rem; }
    p { margin-bottom: 1em; }
    a { color: #059669; }
    code {
      background: #f3f4f6;
      padding: 0.15em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre {
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      margin-bottom: 1em;
    }
    pre code { background: none; padding: 0; color: inherit; }
    pre.mermaid { background: none; color: inherit; text-align: center; padding: 1rem 0; }
    blockquote {
      border-left: 3px solid #d1d5db;
      padding-left: 1rem;
      color: #6b7280;
      margin-bottom: 1em;
    }
    ul, ol { margin-bottom: 1em; padding-left: 1.5em; }
    li { margin-bottom: 0.25em; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
    th, td { border: 1px solid #e5e7eb; padding: 0.5rem 0.75rem; text-align: left; }
    th { background: #f9fafb; font-weight: 600; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
    /* Header */
    .site-header { position: sticky; top: 0; z-index: 100; background: rgba(250,250,250,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid #e5e7eb; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; padding: 10px 24px; }
    .header-logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
    .header-logo-text { font-family: ui-monospace, 'SF Mono', SFMono-Regular, 'Courier New', monospace; font-size: 1rem; font-weight: 700; letter-spacing: -0.5px; color: #1a1a1a; }
    .header-nav { display: flex; align-items: center; gap: 8px; }
    .header-btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.4rem 0.9rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all 0.15s; }
    .header-btn-primary { background: var(--green, ${BRAND_COLOR}); color: #fff; }
    .header-btn-primary:hover { background: #059669; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
    .header-btn-ghost { background: transparent; color: #6b7280; border: 1px solid #e5e7eb; }
    .header-btn-ghost:hover { border-color: #9ca3af; color: #1a1a1a; transform: translateY(-1px); }
    .header-btn-ghost svg { width: 14px; height: 14px; }

    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-bottom: 1rem;
    }
    .footer a {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 500;
      color: #6b7280;
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      padding: 0.4rem 0.9rem;
      transition: all 0.2s;
    }
    .footer a:hover { color: #047857; background: #ecfdf5; border-color: #a7f3d0; transform: translateY(-1px); box-shadow: 0 2px 8px rgba(16,185,129,0.1); }
    .footer .logo-icon { width: 16px; height: 16px; flex-shrink: 0; }
    .footer .brand { color: #047857; font-weight: 700; font-family: ui-monospace, 'SF Mono', monospace; font-size: 0.78rem; letter-spacing: -0.02em; }
    @media (prefers-color-scheme: dark) {
      body { background: #1a1a1a; color: #e5e5e5; }
      .container { background: #2a2a2a; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
      a { color: #34d399; }
      code { background: #3a3a3a; }
      blockquote { border-left-color: #555; color: #aaa; }
      th, td { border-color: #444; }
      th { background: #333; }
      hr { border-top-color: #444; }
      .site-header { background: rgba(26,26,26,0.85); border-bottom-color: #333; }
      .header-logo-text { color: #e5e5e5; }
      .header-btn-ghost { border-color: #333; color: #b0b0b0; }
      .header-btn-ghost:hover { border-color: #555; color: #e5e5e5; }
      .header-btn-ghost svg { fill: #b0b0b0; }
      .footer a { color: #888; background: #222; border-color: #333; }
      .footer a:hover { color: #34d399; background: #0d2818; border-color: #065f46; box-shadow: 0 2px 8px rgba(16,185,129,0.15); }
      .footer .brand { color: #34d399; }
    }
    @media (max-width: 600px) {
      body { padding: 0; background: #fff; }
      .container { max-width: 100%; border-radius: 0; box-shadow: none; padding: 1.25rem 1rem 2rem; }
      .header-inner { padding: 10px 16px; }
      .header-logo-text { font-size: 0.9rem; }
      @media (prefers-color-scheme: dark) {
        body { background: #2a2a2a; }
      }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="https://md.page" class="header-logo">
        <svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="11" fill="${BRAND_COLOR}"/><g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" transform="translate(11, 8)"><line x1="11" y1="2" x2="7" y2="32"/><line x1="21" y1="2" x2="17" y2="32"/><line x1="4" y1="11" x2="25" y2="11"/><line x1="3" y1="23" x2="24" y2="23"/></g></svg>
        <span class="header-logo-text">md.page</span>
      </a>
      <nav class="header-nav">
        <a href="https://md.page/docs" style="font-size:0.85rem;font-weight:600;color:#6b7280;text-decoration:none;transition:color 0.15s;">Docs</a>
        <a href="https://github.com/maypaz/md.page" target="_blank" class="header-btn header-btn-ghost"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> GitHub</a>
        <a href="https://md.page/login" class="header-btn header-btn-primary">Sign in &rarr;</a>
      </nav>
    </div>
  </header>
  <div class="container">${content}</div>
  <div class="footer">
    <a href="https://md.page" target="_blank"><svg class="logo-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" rx="11" fill="${BRAND_COLOR}"/><g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" transform="translate(11, 8)"><line x1="11" y1="2" x2="7" y2="32"/><line x1="21" y1="2" x2="17" y2="32"/><line x1="4" y1="11" x2="25" y2="11"/><line x1="3" y1="23" x2="24" y2="23"/></g></svg> Made with <span class="brand">md.page</span></a>
  </div>${content.includes('class="mermaid"') ? `
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'default',
    });
  </script>` : ''}
</body>
</html>`;
}

export function expiredPageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Page expired — md.page</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1a1a1a; background: #fafafa; padding: 2rem 1rem; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { max-width: 480px; background: #fff; border-radius: 8px; padding: 2.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); text-align: center; }
    h1 { font-size: 1.4rem; margin-bottom: 0.5rem; }
    p { color: #6b7280; margin-bottom: 1rem; font-size: 0.95rem; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.8rem; text-align: left; margin: 1.25rem 0; }
    .cta { display: inline-block; background: #059669; color: #fff; padding: 0.6rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 0.9rem; }
    .cta:hover { background: #047857; }
    @media (prefers-color-scheme: dark) {
      body { background: #1a1a1a; color: #e5e5e5; }
      .card { background: #2a2a2a; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
      p { color: #9ca3af; }
      .cta { background: #10b981; }
      .cta:hover { background: #059669; }
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>This page has expired</h1>
    <p>Pages on md.page auto-delete after 24 hours.</p>
    <p>Create your own in one command:</p>
    <pre><code>npx mdpage-cli README.md</code></pre>
    <a href="https://md.page" class="cta">Visit md.page</a>
  </div>
</body>
</html>`;
}

export function landingPageHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>md.page</title>
  <meta name="description" content="Instantly convert Markdown to a shareable HTML page.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="md.page">
  <meta property="og:description" content="Instantly convert Markdown to a shareable HTML page.">
  <meta property="og:image" content="${origin}/og-image.png">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${origin}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="canonical" href="https://md.page/">
  <link rel="alternate" hreflang="en" href="https://md.page/">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"SoftwareApplication","name":"md.page","url":"${origin}","description":"Instantly convert Markdown to a shareable HTML page. Publish markdown as beautiful web pages with one API call.","applicationCategory":"DeveloperApplication","operatingSystem":"Any","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Organization","name":"md.page","url":"${origin}"},"softwareHelp":{"@type":"WebPage","url":"${origin}/docs"},"featureList":["Markdown to HTML conversion","Shareable page URLs","Anonymous 24-hour pages","Permanent pages with custom subdomains (hosted service)","MCP server for AI agents","REST API","Mermaid diagram support","Auto-generated Open Graph images"],"sameAs":["https://github.com/maypaz/md.page","https://www.npmjs.com/package/mdpage-mcp","https://skills.sh/maypaz/md.page/publish-to-mdpage"]}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","name":"md.page","url":"${origin}","logo":"${origin}/favicon.svg","sameAs":["https://github.com/maypaz/md.page"],"description":"md.page turns Markdown into shareable web pages with one API call."}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is md.page?","acceptedAnswer":{"@type":"Answer","text":"md.page is a web service that converts Markdown content into clean, hosted HTML pages with shareable URLs. It offers anonymous temporary pages (24-hour expiry, no signup) and, on the hosted md.page service, permanent pages with custom subdomains for signed-in users."}},{"@type":"Question","name":"Do I need to sign up to use md.page?","acceptedAnswer":{"@type":"Answer","text":"No. You can publish anonymous pages without any signup. Just POST your markdown to the API and get a shareable URL. Pages expire after 24 hours. For permanent pages, sign in with Google at md.page."}},{"@type":"Question","name":"How do I use md.page with AI agents?","acceptedAnswer":{"@type":"Answer","text":"md.page integrates with AI agents via MCP server (npx -y mdpage-mcp), Claude Code skill (npx skills add maypaz/md.page), or direct API calls. Any agent that can make HTTP requests can publish markdown as web pages."}},{"@type":"Question","name":"Is md.page free?","acceptedAnswer":{"@type":"Answer","text":"Yes. Both anonymous and authenticated tiers are completely free. Anonymous pages expire after 24 hours. Signed-in users on md.page get permanent pages with a personal subdomain."}}]}</script>
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage","name":"md.page","url":"${origin}","speakable":{"@type":"SpeakableSpecification","cssSelector":[".hero h1",".hero-sub"]}}</script>
  <style>
    :root {
      --green: ${BRAND_COLOR};
      --green-dark: #059669;
      --bg-primary: #ffffff;
      --bg-secondary: #f8f9fb;
      --bg-gradient: linear-gradient(160deg, #f0f2f5, #e4e8ef);
      --text-primary: #1a1a1a;
      --text-secondary: #6b7280;
      --text-tertiary: #9ca3af;
      --border: #e5e7eb;
      --card-bg: #ffffff;
      --card-shadow: 0 4px 20px rgba(0,0,0,0.06);
      --card-shadow-hover: 0 8px 30px rgba(0,0,0,0.1);
      --code-bg: #0d1117;
      --code-text: #e6edf3;
      --radius: 16px;
      --mono: ui-monospace, 'SF Mono', SFMono-Regular, 'Courier New', monospace;
      --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: var(--sans); line-height: 1.6; color: var(--text-primary); background: var(--bg-primary); }
    a { color: var(--green); }

    /* Header */
    .site-header { position: sticky; top: 0; z-index: 100; background: rgba(240,242,245,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; }
    .header-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .header-logo-text { font-family: var(--mono); font-size: 1.15rem; font-weight: 700; letter-spacing: -0.5px; color: var(--text-primary); }
    .header-nav { display: flex; align-items: center; gap: 10px; }
    .header-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all 0.15s; }
    .header-btn-primary { background: var(--green); color: #fff; }
    .header-btn-primary:hover { background: var(--green-dark); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
    .header-btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
    .header-btn-ghost:hover { border-color: var(--text-tertiary); color: var(--text-primary); transform: translateY(-1px); }
    .header-btn-ghost svg { width: 16px; height: 16px; }

    /* Sections */
    .section { padding: 80px 24px; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-heading { font-size: 2.25rem; font-weight: 700; text-align: center; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .section-sub { font-size: 1.1rem; color: var(--text-secondary); text-align: center; max-width: 720px; margin: 0 auto 2.5rem; }

    /* Hero */
    .hero { background: var(--bg-gradient); padding: 48px 24px 60px; text-align: center; }
    .hero h1 { font-size: 3rem; font-weight: 700; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 1rem; }
    .hero-video { max-width: 680px; margin: 0 auto 2.5rem; border-radius: 14px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
    .hero-video video { width: 100%; display: block; }
    .hero-sub { font-size: 1.15rem; color: var(--text-secondary); max-width: 560px; margin: 0 auto 1.5rem; line-height: 1.6; }
    .hero-ctas { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 0 auto 2.5rem; }
    .hero-cta { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.1rem; border-radius: 8px; font-size: 0.82rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all 0.15s; }
    .hero-cta:active { transform: scale(0.97); }
    .hero-cta-primary { background: var(--green); color: #fff; }
    .hero-cta-primary:hover { background: var(--green-dark); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
    .hero-cta-secondary { background: transparent; color: var(--text-secondary); border: 1.5px solid var(--text-tertiary); }
    .hero-cta-secondary:hover { border-color: var(--green); color: var(--green); transform: translateY(-1px); }

    /* Agent parade */
    .parade-label { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-tertiary); margin-bottom: 0.75rem; }
    .parade { display: inline-flex; align-items: center; gap: 20px; padding: 12px 28px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
    .parade-item { display: flex; align-items: center; gap: 8px; }
    .parade-item img { width: 24px; height: 24px; border-radius: 5px; }
    .parade-item span { font-size: 0.82rem; font-weight: 500; color: var(--text-primary); }
    .parade-sep { width: 1px; height: 20px; background: var(--border); }

    /* Agents */
    .agents { background: var(--bg-secondary); }
    .int-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .int-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px 24px 24px; display: flex; flex-direction: column; box-shadow: var(--card-shadow); transition: box-shadow 0.2s, transform 0.2s; }
    .int-card:hover { box-shadow: var(--card-shadow-hover); transform: translateY(-2px); }
    .int-card-title { display: inline-block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.6rem; padding: 0.25rem 0.6rem; border-radius: 4px; }
    .int-card-title.blue { color: #3b82f6; background: rgba(59,130,246,0.1); }
    .int-card-title.green { color: #16a34a; background: rgba(22,163,74,0.1); }
    .int-card-title.purple { color: #7c3aed; background: rgba(124,58,237,0.1); }
    .int-card-desc { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 16px; }
    .int-code-wrap { background: var(--code-bg); border-radius: 10px; overflow: hidden; margin-top: auto; flex: 1; display: flex; flex-direction: column; }
    .int-code-header { display: flex; align-items: center; padding: 10px 16px; gap: 6px; background: #161b22; }
    .dot { width: 10px; height: 10px; border-radius: 50%; }
    .dot-red { background: #ff5f57; }
    .dot-yellow { background: #febc2e; }
    .dot-green { background: #28c840; }
    .int-code-label { color: #6e7681; font-size: 0.6rem; margin-left: auto; font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.05em; }
    .int-code { padding: 14px 16px; font-family: var(--mono); font-size: 0.8rem; color: var(--code-text); line-height: 1.7; position: relative; overflow-x: auto; flex: 1; }
    .int-copy-btn { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
    .int-copy-btn:hover { background: rgba(255,255,255,0.15); }
    .int-copy-btn svg { width: 14px; height: 14px; color: #8b949e; }
    .int-copy-btn.copied svg { color: #7ee787; }
    .cmd-green { color: #7ee787; }
    .cmd-blue { color: #79c0ff; }
    .cmd-orange { color: #ffa657; }
    .cmd-white { color: #e6edf3; }
    .cmd-dim { color: #6e7681; }
    .prompt-link { text-align: center; margin-top: 2rem; }
    .prompt-link button { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--card-bg); border: 1px solid var(--border); color: var(--text-primary); cursor: pointer; font-size: 0.85rem; font-weight: 500; font-family: var(--sans); padding: 0.65rem 1.4rem; border-radius: 10px; transition: all 0.2s; box-shadow: var(--card-shadow); }
    .prompt-link button:hover { border-color: var(--green); color: var(--green); transform: translateY(-1px); box-shadow: var(--card-shadow-hover); }
    .prompt-link button svg { width: 16px; height: 16px; flex-shrink: 0; }
    #copied-msg { text-align: center; margin-top: 0.5rem; color: var(--green); font-size: 0.78rem; opacity: 0; transition: opacity 0.3s; }

    /* Try it */
    .try-section { background: var(--bg-gradient); }
    .try-inner { max-width: 800px; margin: 0 auto; }
    .try-terminal { background: var(--code-bg); border-radius: 14px; overflow: hidden; border: 2px solid #21262d; }
    .try-terminal-header { display: flex; align-items: center; padding: 10px 16px; gap: 6px; background: #161b22; }
    .try-terminal textarea {
      width: 100%; height: 200px; resize: none; overflow: hidden;
      font-family: var(--mono); font-size: 0.85rem; line-height: 1.55;
      background: var(--code-bg); color: var(--code-text);
      border: none; padding: 1rem 1.25rem; outline: none;
    }
    .try-terminal textarea::placeholder { color: #8b949e; }
    .try-actions { display: flex; align-items: center; gap: 0.75rem; margin-top: 1rem; }
    .try-publish-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.8rem 2rem;
      background: linear-gradient(135deg, var(--green), var(--green-dark));
      color: #fff; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 600;
      cursor: pointer; transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
      box-shadow: 0 2px 8px rgba(16,185,129,0.25);
    }
    .try-publish-btn:hover { background: linear-gradient(135deg, #34d399, #059669); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
    .try-publish-btn:active { transform: scale(0.97); }
    .try-publish-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }
    .try-status { font-size: 0.85rem; min-height: 1.2em; }
    .try-status a { color: var(--green); }
    .try-status.error { color: #f87171; }

    /* Footer */
    .site-footer { display: flex; justify-content: space-between; align-items: flex-start; max-width: 1100px; margin: 0 auto; padding: 40px 24px; color: var(--text-tertiary); font-size: 0.75rem; line-height: 1.7; }
    .site-footer a { color: var(--text-tertiary); text-decoration: none; transition: color 0.2s; }
    .site-footer a:hover { color: var(--green); }
    .footer-brand { font-family: var(--mono); font-weight: 700; font-size: 0.85rem; color: var(--text-tertiary); letter-spacing: -0.02em; }
    .footer-right { display: flex; flex-direction: column; gap: 0.3rem; align-items: flex-end; align-self: flex-end; }
    .footer-right a { display: inline-flex; align-items: center; gap: 0.35rem; }

    /* Animations */
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .anim { animation: fadeUp 0.5s ease-out both; }
    .d1 { animation-delay: 0.04s; } .d2 { animation-delay: 0.08s; } .d3 { animation-delay: 0.12s; }
    .d4 { animation-delay: 0.16s; } .d5 { animation-delay: 0.2s; }
    .scroll-anim { opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
    .scroll-anim.visible { opacity: 1; transform: translateY(0); }

    /* Tablet */
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.25rem; }
      .section-heading { font-size: 1.75rem; }
      .int-cards { grid-template-columns: 1fr 1fr; }
      .int-cards .int-card:last-child { grid-column: 1 / -1; }
      .parade { gap: 14px; padding: 10px 20px; flex-wrap: wrap; justify-content: center; }
    }

    /* Mobile */
    @media (max-width: 480px) {
      .hero { padding: 40px 16px 48px; }
      .hero h1 { font-size: 1.75rem; }
      .hero-sub { font-size: 1rem; }
      .hero-video { border-radius: 10px; }
      .section { padding: 48px 16px; }
      .section-heading { font-size: 1.5rem; }
      .section-sub { font-size: 0.95rem; }
      .int-cards { grid-template-columns: 1fr; }
      .int-cards .int-card:last-child { grid-column: auto; }
      .parade { gap: 10px; padding: 10px 16px; }
      .parade-item span { font-size: 0.72rem; }
      .parade-item img { width: 20px; height: 20px; }
      .int-code { font-size: 0.7rem; }
      .site-footer { flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; }
      .site-footer > div { align-items: center; }
      .footer-right { flex-direction: row; justify-content: center; align-self: center; gap: 1rem; }
      .header-logo-text { font-size: 1rem; }
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      :root {
        --bg-primary: #0a0a0a;
        --bg-secondary: #111111;
        --bg-gradient: linear-gradient(160deg, #0a0a0a, #111118);
        --text-primary: #e5e5e5;
        --text-secondary: #b0b0b0;
        --text-tertiary: #666;
        --border: #2a2a2a;
        --card-bg: #161616;
        --card-shadow: 0 4px 20px rgba(0,0,0,0.3);
        --card-shadow-hover: 0 8px 30px rgba(0,0,0,0.4);
      }
      .site-header { background: rgba(10,10,10,0.85); border-bottom-color: #2a2a2a; }
      .header-btn-ghost { border-color: #333; color: #b0b0b0; }
      .header-btn-ghost:hover { border-color: #555; color: #e5e5e5; }
      .header-btn-ghost svg { fill: #b0b0b0; }
      .parade { background: var(--card-bg); border-color: var(--border); }
      .try-terminal { border-color: #30363d; }
      .try-terminal-header { background: #0d1117; }
      .hero-video { box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
      #copied-msg { color: #34d399; }
      .try-status a { color: #34d399; }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="header-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48">
          <rect width="48" height="48" rx="11" fill="${BRAND_COLOR}"/>
          <g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" transform="translate(11, 8)">
            <line x1="11" y1="2" x2="7" y2="32"/>
            <line x1="21" y1="2" x2="17" y2="32"/>
            <line x1="4" y1="11" x2="25" y2="11"/>
            <line x1="3" y1="23" x2="24" y2="23"/>
          </g>
        </svg>
        <span class="header-logo-text">md.page</span>
      </a>
      <nav class="header-nav">
        <a href="/docs" style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);text-decoration:none;transition:color 0.15s;">Docs</a>
        <a href="https://github.com/maypaz/md.page" target="_blank" class="header-btn header-btn-ghost" onclick="trackClick('github_click')"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> GitHub</a>
        <a href="https://md.page/login" class="header-btn header-btn-primary">Sign in &rarr;</a>
      </nav>
    </div>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="section-inner">
      <h1 class="anim d1">Markdown in, shareable page out.</h1>
      <p class="hero-sub anim d2">Let your AI agent turn any markdown into a shareable web page.</p>
      <div class="hero-ctas anim d2">
        <a href="#agents-section" class="hero-cta hero-cta-secondary" onclick="smoothScrollToAgents(event)">Set up your agent &darr;</a>
        <a href="https://md.page/login" class="hero-cta hero-cta-primary">Sign in &rarr;</a>
      </div>
      <div class="hero-video anim d3">
        <video autoplay loop muted playsinline preload="auto">
          <source src="/lp.mp4" type="video/mp4">
        </video>
      </div>
      <div class="anim d4">
        <div class="parade-label">Works with</div>
        <div class="parade">
          <div class="parade-item"><img src="/claude-logo.svg" alt="Claude Code"><span>Claude Code</span></div>
          <div class="parade-sep"></div>
          <div class="parade-item"><img src="/cursor-logo.svg" alt="Cursor"><span>Cursor</span></div>
          <div class="parade-sep"></div>
          <div class="parade-item"><img src="/openclaw-logo.svg" alt="OpenClaw"><span>OpenClaw</span></div>
          <div class="parade-sep"></div>
          <div class="parade-item"><img src="/nanoclaw-logo.svg" alt="Nanoclaw"><span>Nanoclaw</span></div>
          <div class="parade-sep"></div>
          <div class="parade-item"><img src="data:image/png;base64,${HERMES_LOGO_PNG_B64}" alt="Hermes" style="border-radius:5px;"><span>Hermes</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- AI Agents -->
  <section class="section agents scroll-anim" id="agents-section">
    <div class="section-inner" style="text-align:center;">
      <h2 class="section-heading">Built for AI agents</h2>
      <p class="section-sub">Your AI can publish Markdown as a beautiful web page with a single tool call.</p>
      <div class="int-cards" style="text-align:left;">
        <div class="int-card">
          <div class="int-card-title blue">Skills</div>
          <p class="int-card-desc">Install the md.page skill and ask your agent to &ldquo;share this as a web page&rdquo;. It just works.</p>
          <div class="int-code-wrap">
            <div class="int-code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span><span class="int-code-label">Terminal</span></div>
            <div class="int-code">
              <button class="int-copy-btn" id="copy-btn-claude" onclick="copySkill('claude')" title="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <span class="cmd-dim"># Claude Code</span><br>
              <span class="cmd-dim">$</span> <span class="cmd-green">npx</span> <span class="cmd-white">skills add maypaz/md.page</span><br>
              <br>
              <span class="cmd-dim"># OpenClaw</span><br>
              <span class="cmd-dim">$</span> <span class="cmd-green">npx</span> <span class="cmd-white">clawhub@latest install</span><br>
              <span class="cmd-white">&nbsp; publish-to-mdpage</span>
            </div>
          </div>
        </div>
        <div class="int-card">
          <div class="int-card-title green">MCP Server</div>
          <p class="int-card-desc">Add md.page as an MCP server. Works with any agent that supports the Model Context Protocol.</p>
          <div class="int-code-wrap">
            <div class="int-code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span><span class="int-code-label">JSON</span></div>
            <div class="int-code">
              <button class="int-copy-btn" id="copy-btn-mcp" onclick="copyMcp()" title="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <span class="cmd-blue">"mcpServers"</span><span class="cmd-white">: {</span><br>
              <span class="cmd-white">&nbsp; </span><span class="cmd-blue">"mdpage"</span><span class="cmd-white">: {</span><br>
              <span class="cmd-white">&nbsp; &nbsp; </span><span class="cmd-blue">"command"</span><span class="cmd-white">: </span><span class="cmd-orange">"npx"</span><span class="cmd-white">,</span><br>
              <span class="cmd-white">&nbsp; &nbsp; </span><span class="cmd-blue">"args"</span><span class="cmd-white">: [</span><span class="cmd-orange">"-y"</span><span class="cmd-white">, </span><span class="cmd-orange">"mdpage-mcp"</span><span class="cmd-white">]</span><br>
              <span class="cmd-white">}}</span>
            </div>
          </div>
        </div>
        <div class="int-card">
          <div class="int-card-title purple">API</div>
          <p class="int-card-desc">One HTTP call is all it takes. Any agent or LLM that can make requests works out of the box.</p>
          <div class="int-code-wrap">
            <div class="int-code-header"><span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span><span class="int-code-label">API</span></div>
            <div class="int-code">
              <button class="int-copy-btn" id="copy-btn-api" onclick="copyApiCurl()" title="Copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>
              <span class="cmd-dim">$</span> <span class="cmd-green">curl</span> <span class="cmd-blue">-X POST</span> \\<br>
              <span class="cmd-white">&nbsp; </span><span class="cmd-orange">${origin}/api/publish</span> \\<br>
              <span class="cmd-white">&nbsp; </span><span class="cmd-blue">-d</span> <span class="cmd-orange">'{"markdown": "..."}'</span><br>
              <br>
              <span class="cmd-dim"># &rarr; {"url": "${origin}/kR4x9p"}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="prompt-link">
        <button onclick="copyAgentPrompt()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy prompt for any AI agent</button>
      </div>
      <p id="copied-msg">Copied! Paste it into any AI agent.</p>
    </div>
  </section>

  <!-- Try it -->
  <section class="section try-section scroll-anim" id="try-section">
    <div class="try-inner">
      <h2 class="section-heading">Try it now</h2>
      <p class="section-sub">Paste some Markdown and see it live.</p>
      <div class="try-terminal">
        <div class="try-terminal-header">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        <textarea id="try-md" placeholder="# Hello World\n\nPaste your **Markdown** here and hit publish.\n\n- Lists work\n- So do [links](https://example.com)\n- And \`inline code\`" spellcheck="false"></textarea>
      </div>
      <div class="try-actions">
        <button class="try-publish-btn" id="try-publish" onclick="publishMarkdown()">Publish &#128640;</button>
        <span class="try-status" id="try-status"></span>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="site-footer">
    <div>
      <div style="display: inline-flex; align-items: center; gap: 6px; margin-bottom: 0.35rem;">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
          <rect width="48" height="48" rx="11" fill="${BRAND_COLOR}"/>
          <g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" transform="translate(11, 8)">
            <line x1="11" y1="2" x2="7" y2="32"/>
            <line x1="21" y1="2" x2="17" y2="32"/>
            <line x1="4" y1="11" x2="25" y2="11"/>
            <line x1="3" y1="23" x2="24" y2="23"/>
          </g>
        </svg>
        <span class="footer-brand">md.page</span>
      </div>
      <div style="margin-bottom: 0.2rem;">Built by two developers who got tired of screenshotting markdown.</div>
      <div><a href="https://www.linkedin.com/in/maypaz/" target="_blank">Or May-Paz</a> &amp; <a href="https://www.linkedin.com/in/matanl/" target="_blank">Matan Lachmish</a></div>
    </div>
    <div class="footer-right">
      <a href="https://github.com/maypaz/md.page" target="_blank"><svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> GitHub</a>
      <a href="/privacy">Privacy</a>
    </div>
  </footer>

  <script>
    window.scrollTo(0, 0);

    function smoothScrollToAgents(e) {
      e.preventDefault();
      var target = document.getElementById('agents-section');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-anim').forEach(function(el) {
      observer.observe(el);
    });

    function trackClick(event) {
      fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: event, ref: document.referrer || '' }),
      }).catch(function() {});
    }

    var clipSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
    var checkSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

    function flashCopy(btnId) {
      var btn = document.getElementById(btnId);
      btn.classList.add('copied');
      btn.innerHTML = checkSvg;
      setTimeout(function() {
        btn.classList.remove('copied');
        btn.innerHTML = clipSvg;
      }, 2000);
    }

    function copyAndTrack(text, btnId, event) {
      navigator.clipboard.writeText(text);
      flashCopy(btnId);
      trackClick(event);
    }

    function copySkill(type) {
      var cmds = { claude: 'npx skills add maypaz/md.page', openclaw: 'npx clawhub@latest install publish-to-mdpage' };
      copyAndTrack(cmds[type], 'copy-btn-claude', 'copy_skill_' + type);
    }

    function copyMcp() {
      copyAndTrack(JSON.stringify({"mcpServers":{"mdpage":{"command":"npx","args":["-y","mdpage-mcp"]}}}, null, 2), 'copy-btn-mcp', 'copy_mcp');
    }

    function copyApiCurl() {
      copyAndTrack('curl -X POST ${origin}/api/publish -H "Content-Type: application/json" -d \\'{"markdown": "# Hello World"}\\'', 'copy-btn-api', 'copy_api_curl');
    }

    function publishMarkdown() {
      var md = document.getElementById('try-md').value.trim();
      var btn = document.getElementById('try-publish');
      var status = document.getElementById('try-status');
      if (!md) { md = document.getElementById('try-md').placeholder; }
      btn.disabled = true;
      btn.textContent = 'Publishing\\u2026';
      status.className = 'try-status'; status.textContent = '';
      fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: md })
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data.url) {
          status.className = 'try-status';
          status.innerHTML = 'Published! <a href="' + data.url + '" target="_blank">' + data.url + '</a>';
          window.open(data.url, '_blank');
          trackClick('try_publish');
        } else {
          status.className = 'try-status error';
          status.textContent = data.error || 'Something went wrong.';
        }
      }).catch(function() {
        status.className = 'try-status error';
        status.textContent = 'Network error. Please try again.';
      }).finally(function() {
        btn.disabled = false;
        btn.innerHTML = 'Publish &#128640;';
      });
    }

    function copyAgentPrompt() {
      navigator.clipboard.writeText("From now on, whenever I ask you to share or publish a markdown file, use the md.page API to create a shareable HTML page. Send a POST request to https://md.page/api/publish with the body {\\"markdown\\": \\"<content>\\"} and return the shareable URL to me.");
      document.getElementById('copied-msg').style.opacity = '1';
      setTimeout(function() { document.getElementById('copied-msg').style.opacity = '0'; }, 3000);
      trackClick('copy_prompt_click');
    }
  </script>
  <script>
    // WebMCP — expose site tools to AI agents via the browser
    if (typeof navigator !== 'undefined' && navigator.modelContext) {
      navigator.modelContext.registerTool({
        name: 'publish-markdown',
        description: 'Publish markdown content as a shareable web page on md.page. Returns a URL that expires in 24 hours.',
        inputSchema: {
          type: 'object',
          properties: {
            markdown: { type: 'string', description: 'The markdown content to publish' }
          },
          required: ['markdown']
        },
        execute: function(input) {
          return fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markdown: input.markdown })
          }).then(function(r) { return r.json(); });
        }
      });
    }
  </script>
</body>
</html>`;
}

export function apiDocsPageHtml(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Docs — md.page</title>
  <meta name="description" content="md.page API documentation. Publish and manage Markdown pages programmatically.">
  <meta property="og:type" content="website">
  <meta property="og:title" content="API Docs — md.page">
  <meta property="og:description" content="md.page API documentation. Publish and manage Markdown pages programmatically.">
  <meta property="og:image" content="${origin}/og-image.png">
  <meta property="og:url" content="${origin}/docs">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>
    :root {
      --green: ${BRAND_COLOR};
      --green-dark: #059669;
      --bg: #ffffff;
      --bg-secondary: #f8f9fb;
      --text: #1a1a1a;
      --text-secondary: #6b7280;
      --text-muted: #9ca3af;
      --border: #e5e7eb;
      --code-bg: #0d1117;
      --code-text: #e6edf3;
      --mono: ui-monospace, 'SF Mono', SFMono-Regular, 'Courier New', monospace;
      --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0a0a0a;
        --bg-secondary: #111111;
        --text: #e5e5e5;
        --text-secondary: #b0b0b0;
        --text-muted: #666;
        --border: #2a2a2a;
      }
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; scroll-padding-top: 80px; }
    body { font-family: var(--sans); color: var(--text); background: var(--bg); line-height: 1.6; -webkit-font-smoothing: antialiased; }

    /* Header */
    .site-header { position: sticky; top: 0; z-index: 100; background: rgba(240,242,245,0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
    @media (prefers-color-scheme: dark) { .site-header { background: rgba(10,10,10,0.85); } }
    .header-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; }
    .header-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
    .header-logo-text { font-family: var(--mono); font-size: 1.15rem; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
    .header-nav { display: flex; align-items: center; gap: 10px; }
    .header-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 1.1rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all 0.15s; }
    .header-btn-primary { background: var(--green); color: #fff; }
    .header-btn-primary:hover { background: var(--green-dark); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(16,185,129,0.3); }
    .header-btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
    .header-btn-ghost:hover { border-color: var(--text-muted); color: var(--text); transform: translateY(-1px); }
    .header-btn-ghost svg { width: 16px; height: 16px; }

    /* Layout */
    .docs-layout { display: flex; max-width: 860px; margin: 0 auto; padding: 0 24px; }
    .docs-nav { width: 200px; flex-shrink: 0; padding: 2rem 0; position: sticky; top: 60px; align-self: flex-start; max-height: calc(100vh - 60px); overflow-y: auto; }
    .docs-nav a { display: block; padding: 0.3rem 0.75rem; font-size: 0.8rem; color: var(--text-secondary); text-decoration: none; border-left: 2px solid transparent; transition: all 0.15s; }
    .docs-nav a:hover { color: var(--text); border-left-color: var(--border); }
    .docs-nav a.active { color: var(--green); border-left-color: var(--green); font-weight: 600; }
    .nav-section { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); padding: 1rem 0.75rem 0.4rem; }
    .nav-section:first-child { padding-top: 0; }

    /* Content */
    .docs-content { flex: 1; min-width: 0; padding: 2rem 0 4rem 3rem; border-left: 1px solid var(--border); }

    /* Hero */
    .docs-hero { background: #0d1117; border-bottom: 1px solid #21262d; padding: 3rem 24px 2.5rem; position: relative; overflow: hidden; }
    .docs-hero::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08), transparent); pointer-events: none; }
    .docs-hero-inner { max-width: 860px; margin: 0 auto; position: relative; z-index: 1; }
    .docs-hero-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 2.5rem; }
    .docs-hero-text { flex: 0 0 auto; }
    .docs-hero h1 { font-family: var(--mono); font-size: 1.6rem; font-weight: 700; letter-spacing: -0.03em; color: #f0f6fc; margin-bottom: 0.4rem; line-height: 1.2; }
    .docs-hero h1 .accent { color: ${BRAND_COLOR}; }
    .docs-hero p { font-size: 0.85rem; color: #8b949e; max-width: 340px; margin-bottom: 1rem; line-height: 1.55; }
    .hero-actions { display: flex; gap: 0.5rem; align-items: center; }
    .copy-docs-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.9rem; border-radius: 6px; font-size: 0.78rem; font-weight: 600; font-family: var(--mono); background: ${BRAND_COLOR}; color: #fff; border: none; cursor: pointer; transition: all 0.15s; }
    .copy-docs-btn:hover { background: var(--green-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16,185,129,0.3); }
    .copy-docs-btn:active { transform: scale(0.97); }
    .copy-docs-btn svg { width: 14px; height: 14px; }
    .hero-hint { font-size: 0.68rem; color: #484f58; }

    /* Hero terminal */
    .hero-terminal { flex: 1; min-width: 0; max-width: 420px; background: #161b22; border: 1px solid #30363d; border-radius: 8px; overflow: hidden; animation: termUp 0.5s ease both; animation-delay: 0.15s; }
    @keyframes termUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .hero-terminal-bar { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #0d1117; border-bottom: 1px solid #21262d; }
    .term-dot { width: 8px; height: 8px; border-radius: 50%; }
    .term-dot-r { background: #ff5f57; }
    .term-dot-y { background: #febc2e; }
    .term-dot-g { background: #28c840; }
    .term-dot-label { margin-left: auto; font-family: var(--mono); font-size: 0.58rem; color: #484f58; text-transform: uppercase; letter-spacing: 0.08em; }
    .hero-terminal-body { padding: 10px 14px; font-family: var(--mono); font-size: 0.72rem; line-height: 1.8; color: #e6edf3; white-space: pre; overflow-x: auto; }
    .t-dim { color: #484f58; }
    .t-green { color: #7ee787; }
    .t-cyan { color: #79c0ff; }
    .t-orange { color: #ffa657; }
    .t-white { color: #f0f6fc; }

    @media (max-width: 700px) {
      .docs-hero-top { flex-direction: column; gap: 1.25rem; }
      .hero-terminal { max-width: 100%; }
    }

    /* Typography */
    .docs-content h2 { font-size: 1.4rem; font-weight: 700; margin: 2.5rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); letter-spacing: -0.02em; }
    .docs-content h2:first-child { margin-top: 0; }
    .docs-content h3 { font-size: 1.05rem; font-weight: 600; margin: 1.75rem 0 0.5rem; }
    .docs-content p { margin: 0 0 1rem; font-size: 0.9rem; }
    .docs-content ul, .docs-content ol { margin: 0 0 1rem; padding-left: 1.5rem; font-size: 0.9rem; }
    .docs-content li { margin-bottom: 0.3rem; }
    .docs-content a { color: var(--green); text-decoration: none; }
    .docs-content a:hover { text-decoration: underline; }
    .docs-content strong { font-weight: 600; }
    .docs-content code { font-family: var(--mono); font-size: 0.82em; background: var(--bg-secondary); border: 1px solid var(--border); padding: 0.15em 0.4em; border-radius: 4px; }
    .docs-content pre { background: var(--code-bg); border-radius: 10px; padding: 1rem 1.25rem; margin: 0 0 1rem; overflow-x: auto; }
    .docs-content pre code { background: none; border: none; padding: 0; color: var(--code-text); font-size: 0.82rem; line-height: 1.7; }
    .docs-content table { width: 100%; border-collapse: collapse; margin: 0 0 1rem; font-size: 0.85rem; }
    .docs-content th, .docs-content td { text-align: left; padding: 0.55rem 0.75rem; border: 1px solid var(--border); }
    .docs-content th { background: var(--bg-secondary); font-weight: 600; font-size: 0.8rem; }
    .docs-content hr { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }

    /* Endpoint blocks */
    .endpoint { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.6rem; padding: 0.55rem 0.85rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; }
    .method { display: inline-block; font-family: var(--mono); font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; letter-spacing: 0.02em; }
    .method-get { background: #dbeafe; color: #1d4ed8; }
    .method-post { background: #d1fae5; color: #059669; }
    .method-put { background: #fef3c7; color: #b45309; }
    .method-delete { background: #fee2e2; color: #dc2626; }
    .method-patch { background: #ede9fe; color: #7c3aed; }
    @media (prefers-color-scheme: dark) {
      .method-get { background: rgba(59,130,246,0.15); color: #60a5fa; }
      .method-post { background: rgba(16,185,129,0.15); color: #34d399; }
      .method-put { background: rgba(245,158,11,0.15); color: #fbbf24; }
      .method-delete { background: rgba(239,68,68,0.15); color: #f87171; }
      .method-patch { background: rgba(139,92,246,0.15); color: #a78bfa; }
    }
    .endpoint-path { font-family: var(--mono); font-size: 0.85rem; font-weight: 500; }

    /* Footer */
    .docs-footer { text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.75rem; border-top: 1px solid var(--border); }
    .docs-footer a { color: var(--text-muted); text-decoration: none; }
    .docs-footer a:hover { color: var(--green); }

    /* Responsive */
    @media (max-width: 768px) {
      .docs-nav { display: none; }
      .docs-content { padding: 2rem 0 4rem; border-left: none; }
      .docs-hero h1 { font-size: 1.3rem; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a href="/" class="header-logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 48 48"><rect width="48" height="48" rx="11" fill="${BRAND_COLOR}"/><g stroke="#fff" stroke-width="4.5" stroke-linecap="round" fill="none" transform="translate(11, 8)"><line x1="11" y1="2" x2="7" y2="32"/><line x1="21" y1="2" x2="17" y2="32"/><line x1="4" y1="11" x2="25" y2="11"/><line x1="3" y1="23" x2="24" y2="23"/></g></svg>
        <span class="header-logo-text">md.page</span>
      </a>
      <nav class="header-nav">
        <a href="/docs" style="font-size:0.85rem;font-weight:600;color:var(--text-secondary);text-decoration:none;transition:color 0.15s;">Docs</a>
        <a href="https://github.com/maypaz/md.page" target="_blank" class="header-btn header-btn-ghost"><svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg> GitHub</a>
        <a href="https://md.page/login" class="header-btn header-btn-primary">Sign in &rarr;</a>
      </nav>
    </div>
  </header>

  <div class="docs-hero">
    <div class="docs-hero-inner">
      <div class="docs-hero-top">
        <div class="docs-hero-text">
          <h1><span class="accent">md.page</span> API</h1>
          <p>Markdown in, shareable page out. One endpoint, no config.</p>
          <div class="hero-actions">
            <button class="copy-docs-btn" onclick="copyDocsLink()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy docs link
            </button>
            <span class="hero-hint">paste into any LLM</span>
          </div>
        </div>
        <div class="hero-terminal">
          <div class="hero-terminal-bar">
            <span class="term-dot term-dot-r"></span>
            <span class="term-dot term-dot-y"></span>
            <span class="term-dot term-dot-g"></span>
            <span class="term-dot-label">terminal</span>
          </div>
          <div class="hero-terminal-body"><span class="t-dim">$</span> <span class="t-white">curl</span> <span class="t-cyan">-X POST</span> ${origin}/api/publish <span class="t-orange">\\</span>
  <span class="t-cyan">-H</span> <span class="t-green">"Content-Type: application/json"</span> <span class="t-orange">\\</span>
  <span class="t-cyan">-d</span> <span class="t-green">'{"markdown": "# Hello"}'</span>

<span class="t-dim">{</span>
  <span class="t-cyan">"url"</span><span class="t-dim">:</span> <span class="t-green">"${origin}/a8Xk2m"</span><span class="t-dim">,</span>
  <span class="t-cyan">"expires_at"</span><span class="t-dim">:</span> <span class="t-green">"2026-04-20T12:00:00Z"</span>
<span class="t-dim">}</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="docs-layout">
    <nav class="docs-nav">
      <div class="nav-section">Basics</div>
      <a href="#overview">Overview</a>
      <a href="#base-url">Base URL</a>
      <a href="#authentication">Auth</a>
      <div class="nav-section">Anonymous</div>
      <a href="#publish">Publish</a>
      <div class="nav-section">Pages</div>
      <a href="#create-page">Create</a>
      <a href="#list-pages">List</a>
      <a href="#update-page">Update</a>
      <a href="#delete-page">Delete</a>
      <a href="#get-user">Current user</a>
      <div class="nav-section">Keys</div>
      <a href="#create-key">Create</a>
      <a href="#list-keys">List</a>
      <a href="#rename-key">Rename</a>
      <a href="#revoke-key">Revoke</a>
      <div class="nav-section">Reference</div>
      <a href="#limits">Limits</a>
      <a href="#errors">Errors</a>
    </nav>

    <div class="docs-content">
      <h2 id="overview">Overview</h2>
      <p>md.page turns Markdown into shareable web pages. Two modes:</p>
      <ul>
        <li><strong>Anonymous</strong> — no auth, pages expire in 24h. Served by this instance.</li>
        <li><strong>Authenticated</strong> — permanent pages at <code>username.md.page/doc-name</code>, served by the hosted <a href="https://md.page">md.page</a>.</li>
      </ul>

      <h2 id="base-url">Base URL</h2>
      <p>Anonymous publishing:</p>
      <pre><code>${origin}</code></pre>
      <p>Accounts, permanent pages, and API keys (hosted service):</p>
      <pre><code>https://md.page</code></pre>

      <h2 id="authentication">Authentication</h2>
      <p>Authenticated endpoints need a Bearer token:</p>
      <pre><code>Authorization: Bearer mdp_your_api_key_here</code></pre>
      <p>Create keys in <a href="https://md.page/login">Settings</a> on the hosted service. Keys start with <code>mdp_</code> and are shown once.</p>
      <p>Anonymous endpoints (<code>POST /api/publish</code>) need no auth.</p>

      <hr>

      <h2 id="publish">Publish a page</h2>
      <div class="endpoint"><span class="method method-post">POST</span> <span class="endpoint-path">/api/publish</span></div>
      <p>Temporary page, expires in 24h. No auth required.</p>
      <h3>Request body</h3>
      <table>
        <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>markdown</code></td><td>string</td><td>Yes</td><td>Markdown content (max 500KB)</td></tr>
      </table>
      <h3>Example</h3>
      <pre><code>curl -X POST ${origin}/api/publish \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# Hello World\\n\\nThis is my page."}'</code></pre>
      <h3>Response <code>201</code></h3>
      <pre><code>{
  "url": "${origin}/a8Xk2m",
  "expires_at": "2026-04-20T12:00:00.000Z"
}</code></pre>

      <hr>

      <h2 id="create-page">Create page</h2>
      <div class="endpoint"><span class="method method-post">POST</span> <span class="endpoint-path">/api/pages</span></div>
      <p>Permanent page on your subdomain. Requires auth.</p>
      <h3>Request body</h3>
      <table>
        <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>markdown</code></td><td>string</td><td>Yes</td><td>Markdown content (max 500KB)</td></tr>
        <tr><td><code>title</code></td><td>string</td><td>No</td><td>Page title. Auto-extracted from <code># heading</code> if omitted.</td></tr>
        <tr><td><code>slug</code></td><td>string</td><td>No</td><td>URL name, e.g. <code>my-doc</code>. Auto-generated from title if omitted.</td></tr>
        <tr><td><code>visibility</code></td><td>string</td><td>No</td><td><code>"public"</code> (default) or <code>"private"</code></td></tr>
      </table>
      <h3>Example</h3>
      <pre><code>curl -X POST https://md.page/api/pages \\
  -H "Authorization: Bearer mdp_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# My Doc", "slug": "my-doc"}'</code></pre>
      <h3>Response <code>201</code></h3>
      <pre><code>{
  "id": "kR4x9p",
  "url": "https://alice.md.page/my-doc",
  "slug": "my-doc",
  "visibility": "public"
}</code></pre>

      <h2 id="list-pages">List pages</h2>
      <div class="endpoint"><span class="method method-get">GET</span> <span class="endpoint-path">/api/pages</span></div>
      <h3>Response <code>200</code></h3>
      <pre><code>{
  "pages": [
    {
      "id": "kR4x9p",
      "slug": "my-doc",
      "title": "My Doc",
      "visibility": "public",
      "view_count": 42,
      "revision_count": 3,
      "created_via": "api:claude-code",
      "created_at": "2026-04-19T10:00:00.000Z",
      "updated_at": "2026-04-19T12:00:00.000Z"
    }
  ]
}</code></pre>

      <h2 id="update-page">Update page</h2>
      <div class="endpoint"><span class="method method-put">PUT</span> <span class="endpoint-path">/api/pages/:id</span></div>
      <p>All fields optional — send only what changed.</p>
      <h3>Request body</h3>
      <table>
        <tr><th>Field</th><th>Type</th><th>Description</th></tr>
        <tr><td><code>markdown</code></td><td>string</td><td>New content</td></tr>
        <tr><td><code>title</code></td><td>string</td><td>New title</td></tr>
        <tr><td><code>slug</code></td><td>string</td><td>New URL name (must be unique)</td></tr>
        <tr><td><code>visibility</code></td><td>string</td><td><code>"public"</code> or <code>"private"</code></td></tr>
      </table>
      <h3>Example</h3>
      <pre><code>curl -X PUT https://md.page/api/pages/kR4x9p \\
  -H "Authorization: Bearer mdp_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# Updated content"}'</code></pre>
      <h3>Response <code>200</code></h3>
      <pre><code>{"ok": true}</code></pre>

      <h2 id="delete-page">Delete page</h2>
      <div class="endpoint"><span class="method method-delete">DELETE</span> <span class="endpoint-path">/api/pages/:id</span></div>
      <h3>Example</h3>
      <pre><code>curl -X DELETE https://md.page/api/pages/kR4x9p \\
  -H "Authorization: Bearer mdp_your_key"</code></pre>
      <h3>Response <code>200</code></h3>
      <pre><code>{"ok": true}</code></pre>

      <h2 id="get-user">Current user</h2>
      <div class="endpoint"><span class="method method-get">GET</span> <span class="endpoint-path">/api/me</span></div>
      <h3>Response <code>200</code></h3>
      <pre><code>{
  "id": "abc123",
  "username": "alice",
  "display_name": "Alice Chen",
  "avatar_url": "https://..."
}</code></pre>

      <hr>

      <h2 id="create-key">Create API key</h2>
      <div class="endpoint"><span class="method method-post">POST</span> <span class="endpoint-path">/api/keys</span></div>
      <h3>Request body</h3>
      <table>
        <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
        <tr><td><code>label</code></td><td>string</td><td>No</td><td>Name for this key, e.g. <code>"claude-code"</code></td></tr>
      </table>
      <h3>Response <code>201</code></h3>
      <pre><code>{
  "id": "uuid",
  "key": "mdp_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345",
  "label": "claude-code"
}</code></pre>
      <p><strong>The key is shown once.</strong> Store it securely.</p>

      <h2 id="list-keys">List keys</h2>
      <div class="endpoint"><span class="method method-get">GET</span> <span class="endpoint-path">/api/keys</span></div>
      <h3>Response <code>200</code></h3>
      <pre><code>{
  "keys": [
    {
      "id": "uuid",
      "label": "claude-code",
      "last_used_at": "2026-04-19T12:00:00.000Z",
      "created_at": "2026-04-18T10:00:00.000Z"
    }
  ]
}</code></pre>

      <h2 id="rename-key">Rename key</h2>
      <div class="endpoint"><span class="method method-patch">PATCH</span> <span class="endpoint-path">/api/keys/:id</span></div>
      <h3>Request body</h3>
      <pre><code>{"label": "new-name"}</code></pre>
      <h3>Response <code>200</code></h3>
      <pre><code>{"ok": true}</code></pre>

      <h2 id="revoke-key">Revoke key</h2>
      <div class="endpoint"><span class="method method-delete">DELETE</span> <span class="endpoint-path">/api/keys/:id</span></div>
      <h3>Response <code>200</code></h3>
      <pre><code>{"ok": true}</code></pre>

      <hr>

      <h2 id="limits">Limits</h2>
      <table>
        <tr><th>Resource</th><th>Limit</th></tr>
        <tr><td>Pages per account</td><td>10</td></tr>
        <tr><td>API keys per account</td><td>5</td></tr>
        <tr><td>Content size</td><td>500 KB</td></tr>
        <tr><td>Anonymous TTL</td><td>24 hours</td></tr>
      </table>

      <h2 id="errors">Errors</h2>
      <p>All errors return JSON with an <code>error</code> field:</p>
      <pre><code>{"error": "Missing 'markdown' field"}</code></pre>
      <table>
        <tr><th>Status</th><th>Meaning</th></tr>
        <tr><td><code>400</code></td><td>Bad request — missing or invalid fields</td></tr>
        <tr><td><code>401</code></td><td>Unauthorized — missing or invalid key</td></tr>
        <tr><td><code>404</code></td><td>Not found</td></tr>
        <tr><td><code>409</code></td><td>Conflict — name already taken</td></tr>
        <tr><td><code>413</code></td><td>Content too large (>500KB)</td></tr>
      </table>
    </div>
  </div>

  <div class="docs-footer">
    <a href="/">md.page</a> &middot; <a href="https://github.com/maypaz/md.page" target="_blank">GitHub</a> &middot; <a href="/privacy">Privacy</a>
  </div>

  <script>
    function copyDocsLink() {
      navigator.clipboard.writeText('${origin}/docs');
      var btn = document.querySelector('.copy-docs-btn');
      var orig = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px;height:14px"><polyline points="20 6 9 17 4 12"/></svg> copied';
      setTimeout(function() { btn.innerHTML = orig; }, 2000);
    }
    var sections = document.querySelectorAll('.docs-content h2[id]');
    var navLinks = document.querySelectorAll('.docs-nav a[href^="#"]');
    window.addEventListener('scroll', function() {
      var current = '';
      sections.forEach(function(s) {
        if (window.scrollY >= s.offsetTop - 100) current = s.id;
      });
      navLinks.forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    });
  </script>
</body>
</html>`;
}

export function privacyPageHtml(origin: string): string {
  return pageTemplate(`
<h1>Privacy Policy</h1>
<p><strong>Last updated:</strong> April 11, 2026</p>

<h2>What md.page does</h2>
<p>md.page converts Markdown into shareable HTML pages. You can use it anonymously (pages expire in 24 hours) or sign in with Google to get permanent pages under your own subdomain.</p>

<h2>Anonymous pages</h2>
<p>No account is required for anonymous pages. Each page is assigned a random 6-character ID and expires automatically after <strong>24 hours</strong>. Once expired, the content is permanently deleted.</p>

<h2>No password protection</h2>
<p>Published pages are <strong>not password-protected or encrypted</strong>. Anyone with the link can view your page (unless you set it to private, which restricts access to the page owner). Do not publish sensitive, confidential, or personal information on public pages.</p>

<h2>Accounts and authentication</h2>
<p>When you sign in with Google, we store:</p>
<ul>
  <li><strong>Your Google ID, name, and profile picture</strong> — used to identify your account and display in the dashboard.</li>
  <li><strong>A session cookie</strong> — an HttpOnly, Secure cookie (<code>session</code>) that keeps you logged in for up to 30 days. This cookie is scoped to <code>.md.page</code> and is not accessible to JavaScript.</li>
  <li><strong>Your pages and metadata</strong> — page titles, doc names, visibility settings, view counts, and timestamps are stored in our database.</li>
  <li><strong>API keys</strong> — if you create API keys, we store a cryptographic hash (SHA-256). The plaintext key is shown only once at creation and is never stored.</li>
</ul>
<p>We do not store your Google password or access token beyond the initial authentication exchange.</p>

<h2>Rate limiting</h2>
<p>To protect against abuse, md.page enforces rate limits on publishing and page access. Automated scanning or scraping is not permitted.</p>

<h2>Data we store</h2>
<ul>
  <li><strong>Anonymous pages:</strong> Rendered HTML, stored in Cloudflare KV for up to 24 hours.</li>
  <li><strong>Permanent pages:</strong> Rendered HTML and original Markdown source, stored indefinitely until you delete the page.</li>
  <li><strong>Account data:</strong> Google ID, username, display name, avatar URL, and session data.</li>
  <li><strong>Aggregate analytics:</strong> Anonymous event counts (page views, publishes) with no personally identifiable information.</li>
</ul>

<h2>Data we do NOT collect</h2>
<ul>
  <li>No browser fingerprinting</li>
  <li>No third-party tracking, advertising, or data sharing</li>
  <li>No email addresses are stored (only your Google ID)</li>
</ul>

<h2>Cookies</h2>
<p>md.page uses the following cookies:</p>
<ul>
  <li><code>session</code> — authentication session (HttpOnly, Secure, SameSite=Lax, 30-day expiry)</li>
  <li><code>oauth_state</code> — temporary CSRF protection during login (HttpOnly, Secure, 10-minute expiry, deleted after use)</li>
</ul>
<p>No third-party cookies or tracking cookies are used.</p>

<h2>Data deletion</h2>
<p>You can delete your pages at any time from the dashboard or via the API. To delete your account entirely, please <a href="https://github.com/maypaz/md.page/issues" target="_blank" rel="noopener">open an issue on GitHub</a>.</p>

<h2>Infrastructure</h2>
<p>md.page runs on <a href="https://workers.cloudflare.com" target="_blank" rel="noopener">Cloudflare Workers</a> and uses <a href="https://developers.cloudflare.com/kv/" target="_blank" rel="noopener">Cloudflare KV</a> and <a href="https://developers.cloudflare.com/d1/" target="_blank" rel="noopener">Cloudflare D1</a> for storage. Cloudflare may process requests according to their own <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">privacy policy</a>.</p>

<h2>Your responsibility</h2>
<p>Do not publish content that is illegal, harmful, or that you do not have the right to share. Do not publish sensitive personal data, passwords, API keys, or confidential information on public pages.</p>

<h2>Contact</h2>
<p>md.page is open source. For questions or concerns, please <a href="https://github.com/maypaz/md.page/issues" target="_blank" rel="noopener">open an issue on GitHub</a>.</p>
`, { title: "Privacy Policy — md.page", description: "Privacy policy for md.page — how your data is handled.", origin });
}

