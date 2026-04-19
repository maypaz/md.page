import { createMiddleware } from "hono/factory";
import type { Env } from "./types";
import { getUserFromCookie, getUserFromApiKey } from "./auth";
import { emit } from "./utils";

export type User = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type AuthEnv = {
  Bindings: Env;
  Variables: { user: User };
};

/** Resolves user from cookie or API key. Sets c.var.user. Returns 401 if not authenticated. */
export const authRequired = createMiddleware<AuthEnv>(async (c, next) => {
  let user = await getUserFromCookie(c.env.DB, c.req.header("cookie") ?? null);

  if (!user) {
    user = await getUserFromApiKey(c.env.DB, c.req.header("authorization") ?? null);
    if (user) emit(c.env, "api_request");
  }

  if (!user) {
    return c.json({
      error: "UNAUTHORIZED",
      message: "Authentication required",
      hint: "Include an Authorization: Bearer <api-key> header. Get an API key from your md.page dashboard.",
      documentation_url: "https://md.page/docs",
      auth_info: "https://md.page/.well-known/oauth-authorization-server",
    }, 401, {
      "WWW-Authenticate": "Bearer realm=\"md.page\", error=\"invalid_token\"",
    });
  }

  c.set("user", user);
  await next();
});
