import type { VercelRequest, VercelResponse } from "@vercel/node";

import healthHandler from "../handlers/health.js";
import loginHandler from "../handlers/auth/login.js";
import logoutHandler from "../handlers/auth/logout.js";
import meHandler from "../handlers/auth/me.js";
import bootstrapHandler from "../handlers/auth/bootstrap.js";
import postsHandler from "../handlers/posts.js";
import dashboardHandler from "../handlers/dashboard.js";
import importPostsHandler from "../handlers/import-posts.js";
import cmsPostHandler from "../handlers/cms-post.js";
import uploadMediaHandler from "../handlers/upload-media.js";
import commentsModerationHandler from "../handlers/comments/moderation.js";
import settingsUsersHandler from "../handlers/settings/users.js";
import captchaHandler from "../handlers/public/captcha.js";
import publicCommentsHandler from "../handlers/public/comments.js";
import postViewHandler from "../handlers/public/post-view.js";
import seoSuggestHandler from "../handlers/seo-suggest.js";
import chatHandler from "../handlers/public/chat.js";

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;

const handlers: Record<string, Record<string, Handler>> = {
  GET: {
    "/api/health": healthHandler as Handler,
    "/api/auth/me": meHandler as unknown as Handler,
    "/api/posts": postsHandler as Handler,
    "/api/dashboard": dashboardHandler as Handler,
    "/api/cms-post": cmsPostHandler as Handler,
    "/api/comments/moderation": commentsModerationHandler as Handler,
    "/api/settings/users": settingsUsersHandler as Handler,
    "/api/public/captcha": captchaHandler as Handler,
    "/api/public/comments": publicCommentsHandler as Handler,
  },
  POST: {
    "/api/auth/login": loginHandler as unknown as Handler,
    "/api/auth/logout": logoutHandler as unknown as Handler,
    "/api/auth/bootstrap": bootstrapHandler as unknown as Handler,
    "/api/import-posts": importPostsHandler as Handler,
    "/api/cms-post": cmsPostHandler as Handler,
    "/api/upload-media": uploadMediaHandler as Handler,
    "/api/seo-suggest": seoSuggestHandler as Handler,
    "/api/public/comments": publicCommentsHandler as Handler,
    "/api/public/post-view": postViewHandler as Handler,
    "/api/public/chat": chatHandler as Handler,
  },
  PATCH: {
    "/api/cms-post": cmsPostHandler as Handler,
    "/api/comments/moderation": commentsModerationHandler as Handler,
    "/api/settings/users": settingsUsersHandler as Handler,
  },
  DELETE: {
    "/api/comments/moderation": commentsModerationHandler as Handler,
    "/api/settings/users": settingsUsersHandler as Handler,
  },
};

const optionHandlers: Record<string, Handler> = {
  "/api/public/captcha": captchaHandler as Handler,
  "/api/public/comments": publicCommentsHandler as Handler,
  "/api/public/post-view": postViewHandler as Handler,
  "/api/public/chat": chatHandler as Handler,
};

function apiPath(req: VercelRequest): string {
  const raw = String(req.url || "/").split("?")[0];
  const normalized = raw.replace(/\/$/, "") || "/";
  if (normalized.startsWith("/api")) return normalized;
  const segments = req.query?.path;
  if (Array.isArray(segments) && segments.length > 0) {
    return `/api/${segments.join("/")}`.replace(/\/$/, "") || "/api";
  }
  if (typeof segments === "string" && segments) {
    return `/api/${segments}`.replace(/\/$/, "") || "/api";
  }
  return normalized;
}

/** Despacha req para o handler correto. Retorna false se a rota nao existir. */
export async function dispatchApi(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const method = req.method?.toUpperCase() || "GET";
  const keyPath = apiPath(req);

  if (method === "OPTIONS") {
    const oh = optionHandlers[keyPath];
    if (!oh) return false;
    await Promise.resolve(oh(req, res));
    return true;
  }

  const handlerFn = handlers[method]?.[keyPath];
  if (!handlerFn) return false;

  await Promise.resolve(handlerFn(req, res));
  return true;
}
