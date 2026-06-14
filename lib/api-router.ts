import type { VercelRequest, VercelResponse } from "@vercel/node";

type Handler = (req: VercelRequest, res: VercelResponse) => unknown;
type HandlerModule = { default: Handler };

const handlerLoaders: Record<string, Record<string, () => Promise<HandlerModule>>> = {
  GET: {
    "/api/health": () => import("../handlers/health.js"),
    "/api/auth/me": () => import("../handlers/auth/me.js"),
    "/api/posts": () => import("../handlers/posts.js"),
    "/api/dashboard": () => import("../handlers/dashboard.js"),
    "/api/cms-post": () => import("../handlers/cms-post.js"),
    "/api/comments/moderation": () => import("../handlers/comments/moderation.js"),
    "/api/settings/users": () => import("../handlers/settings/users.js"),
    "/api/public/captcha": () => import("../handlers/public/captcha.js"),
    "/api/public/comments": () => import("../handlers/public/comments.js"),
  },
  POST: {
    "/api/auth/login": () => import("../handlers/auth/login.js"),
    "/api/auth/logout": () => import("../handlers/auth/logout.js"),
    "/api/auth/bootstrap": () => import("../handlers/auth/bootstrap.js"),
    "/api/import-posts": () => import("../handlers/import-posts.js"),
    "/api/cms-post": () => import("../handlers/cms-post.js"),
    "/api/upload-media": () => import("../handlers/upload-media.js"),
    "/api/seo-suggest": () => import("../handlers/seo-suggest.js"),
    "/api/instagram-prepare": () => import("../handlers/instagram-prepare.js"),
    "/api/public/comments": () => import("../handlers/public/comments.js"),
    "/api/public/post-view": () => import("../handlers/public/post-view.js"),
    "/api/public/chat": () => import("../handlers/public/chat.js"),
  },
  PATCH: {
    "/api/cms-post": () => import("../handlers/cms-post.js"),
    "/api/comments/moderation": () => import("../handlers/comments/moderation.js"),
    "/api/settings/users": () => import("../handlers/settings/users.js"),
  },
  DELETE: {
    "/api/comments/moderation": () => import("../handlers/comments/moderation.js"),
    "/api/settings/users": () => import("../handlers/settings/users.js"),
  },
};

const optionLoaders: Record<string, () => Promise<HandlerModule>> = {
  "/api/public/captcha": () => import("../handlers/public/captcha.js"),
  "/api/public/comments": () => import("../handlers/public/comments.js"),
  "/api/public/post-view": () => import("../handlers/public/post-view.js"),
  "/api/public/chat": () => import("../handlers/public/chat.js"),
};

function apiPath(req: VercelRequest): string {
  const qp = req.query?.path;
  if (typeof qp === "string" && qp.trim()) {
    return `/api/${qp.replace(/^\/+|\/+$/g, "")}`;
  }
  if (Array.isArray(qp) && qp.length > 0) {
    return `/api/${qp.join("/")}`.replace(/\/$/, "") || "/api";
  }

  const raw = String(req.url || "/").split("?")[0];
  const normalized = raw.replace(/\/$/, "") || "/";
  if (normalized.startsWith("/api") && normalized !== "/api/index") {
    return normalized;
  }
  return normalized;
}

/** Despacha req para o handler correto. Retorna false se a rota nao existir. */
export async function dispatchApi(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const method = req.method?.toUpperCase() || "GET";
  const keyPath = apiPath(req);

  if (method === "OPTIONS") {
    const load = optionLoaders[keyPath];
    if (!load) return false;
    const mod = await load();
    await Promise.resolve(mod.default(req, res));
    return true;
  }

  const load = handlerLoaders[method]?.[keyPath];
  if (!load) return false;

  const mod = await load();
  await Promise.resolve(mod.default(req, res));
  return true;
}
