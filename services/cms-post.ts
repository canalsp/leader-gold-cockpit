import { toSlug } from "../lib/post-mapper.js";
import type { PostStatus } from "../types/post.js";

export type CmsPostPayload = {
  id?: number;
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: string;
  featured_image?: string | null;
  tags?: string[];
  categories?: string[];
  author_name?: string | null;
  source?: string | null;
  source_url?: string | null;
  status?: PostStatus;
  published_at?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  seo_ai_report?: string | null;
  instagram_prepare?: boolean;
  instagram_draft?: Record<string, unknown> | null;
};

const ALLOWED_STATUS: PostStatus[] = ["draft", "published", "scheduled"];

function normalizeTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((t) => String(t).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseCmsPayload(body: unknown): CmsPostPayload {
  if (!body || typeof body !== "object") {
    throw new Error("Body JSON invalido");
  }
  const b = body as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) {
    throw new Error("Titulo obrigatorio");
  }
  const rawSlug = b.slug != null ? String(b.slug).trim() : "";
  const slug = rawSlug ? toSlug(rawSlug) : toSlug(title);
  if (!slug) {
    throw new Error("Slug invalido");
  }
  const status = (b.status != null ? String(b.status) : "draft") as PostStatus;
  if (!ALLOWED_STATUS.includes(status)) {
    throw new Error("Status invalido (draft, published, scheduled)");
  }
  const id = typeof b.id === "number" && Number.isFinite(b.id) ? b.id : undefined;

  return {
    id,
    title,
    slug,
    excerpt: b.excerpt != null ? String(b.excerpt) : null,
    content: b.content != null ? String(b.content) : "",
    featured_image: b.featured_image != null ? String(b.featured_image) : null,
    tags: normalizeTags(b.tags),
    categories: normalizeTags(b.categories),
    author_name: b.author_name != null ? String(b.author_name).trim() || null : null,
    source: b.source != null ? String(b.source).trim() || null : null,
    source_url: b.source_url != null ? String(b.source_url).trim() || null : null,
    status,
    published_at: b.published_at != null ? String(b.published_at) : null,
    meta_title: b.meta_title != null ? String(b.meta_title).trim() || null : null,
    meta_description: b.meta_description != null ? String(b.meta_description).trim() || null : null,
    focus_keyword: b.focus_keyword != null ? String(b.focus_keyword).trim() || null : null,
    seo_ai_report: b.seo_ai_report != null ? String(b.seo_ai_report) : null,
    instagram_prepare: Boolean(b.instagram_prepare),
    instagram_draft:
      b.instagram_draft != null && typeof b.instagram_draft === "object" && !Array.isArray(b.instagram_draft)
        ? (b.instagram_draft as Record<string, unknown>)
        : null,
  };
}

export function rowForInsert(payload: CmsPostPayload): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    legacy_id: null,
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: payload.content ?? "",
    featured_image: payload.featured_image,
    author_legacy_id: null,
    author_name: payload.author_name,
    tags: payload.tags ?? [],
    categories: payload.categories ?? [],
    source: payload.source,
    source_url: payload.source_url,
    status: payload.status,
    published_at: payload.published_at,
    meta_title: payload.meta_title,
    meta_description: payload.meta_description,
    focus_keyword: payload.focus_keyword,
    seo_ai_report: payload.seo_ai_report,
    instagram_prepare: payload.instagram_prepare ?? false,
    instagram_draft: payload.instagram_draft ?? null,
    view_count: 0,
    created_at: now,
    updated_at: now
  };
}

export function rowForUpdate(payload: CmsPostPayload): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    title: payload.title,
    slug: payload.slug,
    excerpt: payload.excerpt,
    content: payload.content ?? "",
    featured_image: payload.featured_image,
    author_name: payload.author_name,
    tags: payload.tags ?? [],
    categories: payload.categories ?? [],
    source: payload.source,
    source_url: payload.source_url,
    status: payload.status,
    published_at: payload.published_at,
    meta_title: payload.meta_title,
    meta_description: payload.meta_description,
    focus_keyword: payload.focus_keyword,
    seo_ai_report: payload.seo_ai_report,
    instagram_prepare: payload.instagram_prepare ?? false,
    instagram_draft: payload.instagram_draft ?? null,
    updated_at: now
  };
}
