export const SHARE_CHANNELS = ["whatsapp", "linkedin", "facebook", "twitter", "copy"] as const;
export type ShareChannel = (typeof SHARE_CHANNELS)[number];

export function parseShareChannel(raw: unknown): ShareChannel | null {
  const c = String(raw ?? "").trim().toLowerCase();
  return (SHARE_CHANNELS as readonly string[]).includes(c) ? (c as ShareChannel) : null;
}

export function normalizePagePath(raw: unknown): string {
  let p = String(raw ?? "").trim();
  if (!p) return "/";
  try {
    if (/^https?:\/\//i.test(p)) {
      p = new URL(p).pathname;
    }
  } catch {
    /* mantem string */
  }
  if (!p.startsWith("/")) p = `/${p}`;
  const clean = p.split("?")[0]?.split("#")[0] || "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

export function bumpChannelCounts(
  current: Record<string, number> | null | undefined,
  channel: ShareChannel,
): Record<string, number> {
  const next = { ...(current ?? {}) };
  next[channel] = Number(next[channel] ?? 0) + 1;
  return next;
}

export function isPostVisible(status: string | null, publishedAt: string | null, now = Date.now()): boolean {
  const st = status ?? "draft";
  const t = publishedAt ? new Date(publishedAt).getTime() : null;
  if (st === "published") return t == null || !Number.isFinite(t) || t <= now;
  if (st === "scheduled") return t != null && Number.isFinite(t) && t <= now;
  return false;
}
