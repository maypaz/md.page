import { describe, it, expect } from "vitest";
import { normalizeReferrer, deviceClass, visitorHash } from "./utils";

describe("normalizeReferrer", () => {
  it("returns direct when referrer is missing", () => {
    expect(normalizeReferrer(null, "md.page")).toBe("direct");
    expect(normalizeReferrer(undefined, "md.page")).toBe("direct");
    expect(normalizeReferrer("", "md.page")).toBe("direct");
  });

  it("returns direct for unparseable referrers", () => {
    expect(normalizeReferrer("not a url", "md.page")).toBe("direct");
    expect(normalizeReferrer("://broken", "md.page")).toBe("direct");
  });

  it("normalizes to lowercase host without www", () => {
    expect(normalizeReferrer("https://WWW.News.Ycombinator.com/item?id=1", "md.page")).toBe("news.ycombinator.com");
    expect(normalizeReferrer("https://t.co/abc", "md.page")).toBe("t.co");
  });

  it("marks own host and *.md.page as internal", () => {
    expect(normalizeReferrer("https://md.page/abc", "md.page")).toBe("internal");
    expect(normalizeReferrer("https://alice.md.page/notes", "md.page")).toBe("internal");
    expect(normalizeReferrer("https://www.md.page/", "md.page")).toBe("internal");
    expect(normalizeReferrer("https://alice.md.page/x", "bob.md.page")).toBe("internal");
  });

  it("does not treat lookalike domains as internal", () => {
    expect(normalizeReferrer("https://notmd.page/", "md.page")).toBe("notmd.page");
    expect(normalizeReferrer("https://md.page.evil.com/", "md.page")).toBe("md.page.evil.com");
  });
});

describe("deviceClass", () => {
  it("returns none without a user agent", () => {
    expect(deviceClass(null)).toBe("none");
    expect(deviceClass("")).toBe("none");
  });

  it("detects bots and scripts", () => {
    expect(deviceClass("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe("bot");
    expect(deviceClass("curl/8.4.0")).toBe("bot");
    expect(deviceClass("python-requests/2.31")).toBe("bot");
    expect(deviceClass("axios/1.6.0")).toBe("bot");
  });

  it("detects tablets before mobile", () => {
    expect(deviceClass("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    expect(deviceClass("Mozilla/5.0 (Linux; Android 13; SM-X710 Tablet)")).toBe("tablet");
  });

  it("detects mobile", () => {
    expect(deviceClass("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148")).toBe("mobile");
    expect(deviceClass("Mozilla/5.0 (Linux; Android 14; Pixel 8)")).toBe("mobile");
  });

  it("defaults to desktop", () => {
    expect(deviceClass("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15")).toBe("desktop");
    expect(deviceClass("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0")).toBe("desktop");
  });
});

describe("visitorHash", () => {
  function req(ip: string | null, ua: string | null): Request {
    const headers = new Headers();
    if (ip) headers.set("CF-Connecting-IP", ip);
    if (ua) headers.set("User-Agent", ua);
    return new Request("https://md.page/", { headers });
  }

  it("is stable for the same visitor within a day", () => {
    expect(visitorHash(req("1.2.3.4", "UA"))).toBe(visitorHash(req("1.2.3.4", "UA")));
  });

  it("differs between visitors", () => {
    expect(visitorHash(req("1.2.3.4", "UA"))).not.toBe(visitorHash(req("5.6.7.8", "UA")));
    expect(visitorHash(req("1.2.3.4", "UA"))).not.toBe(visitorHash(req("1.2.3.4", "UB")));
  });

  it("is 16 hex chars, empty without ip and ua", () => {
    expect(visitorHash(req("1.2.3.4", "UA"))).toMatch(/^[0-9a-f]{16}$/);
    expect(visitorHash(req(null, null))).toBe("");
  });
});
