import { describe, it, expect } from "vitest";
import { validateUsername, slugify } from "./username";

describe("validateUsername", () => {
  it("accepts valid usernames", () => {
    expect(validateUsername("alice-dev").valid).toBe(true);
    expect(validateUsername("johndoe").valid).toBe(true);
    expect(validateUsername("dev-user-123").valid).toBe(true);
    expect(validateUsername("abcdefg").valid).toBe(true);
  });

  it("rejects usernames shorter than 6 characters", () => {
    const result = validateUsername("short");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("6");
  });

  it("rejects usernames with uppercase letters", () => {
    const result = validateUsername("AliceDev");
    expect(result.valid).toBe(false);
  });

  it("rejects usernames with leading hyphens", () => {
    const result = validateUsername("-leading");
    expect(result.valid).toBe(false);
  });

  it("rejects usernames with trailing hyphens", () => {
    const result = validateUsername("trailing-");
    expect(result.valid).toBe(false);
  });

  it("rejects usernames with consecutive hyphens", () => {
    const result = validateUsername("bad--name");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("consecutive");
  });

  it("rejects purely numeric usernames", () => {
    const result = validateUsername("1234567");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("numeric");
  });

  it("rejects reserved usernames", () => {
    expect(validateUsername("dashboard").valid).toBe(false);
    expect(validateUsername("administrator").valid).toBe(false);
    expect(validateUsername("support").valid).toBe(false);
    expect(validateUsername("healthcheck").valid).toBe(false);
  });

  it("rejects usernames with special characters", () => {
    expect(validateUsername("user_name").valid).toBe(false);
    expect(validateUsername("user.name").valid).toBe(false);
    expect(validateUsername("user@name").valid).toBe(false);
  });
});

describe("slugify", () => {
  it("converts title to lowercase slug", () => {
    expect(slugify("Setup Guide")).toBe("setup-guide");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple separators", () => {
    expect(slugify("foo   bar---baz")).toBe("foo-bar-baz");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  it("truncates to 80 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long).length).toBeLessThanOrEqual(80);
  });

  it("returns 'untitled' for empty or whitespace-only input", () => {
    expect(slugify("")).toBe("untitled");
    expect(slugify("   ")).toBe("untitled");
    expect(slugify("!!!")).toBe("untitled");
  });
});
