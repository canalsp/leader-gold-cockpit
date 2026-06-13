import type { MysqlPostRow, SupabasePostInsert } from "../types/post.js";

export function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function mapMysqlPostToSupabase(post: MysqlPostRow): SupabasePostInsert {
  const publishedAt = post.status === "published" ? post.updated_at : null;

  return {
    legacy_id: post.id,
    title: post.title,
    slug: post.slug?.trim() ? post.slug : toSlug(post.title),
    excerpt: post.excerpt,
    content: post.content ?? "",
    featured_image: post.featured_image,
    author_legacy_id: post.author_id,
    author_name: null,
    tags: [],
    categories: [],
    status: post.status,
    source: post.source,
    source_url: post.source_url,
    view_count: post.view_count,
    published_at: publishedAt,
    created_at: post.created_at,
    updated_at: post.updated_at,
    meta_title: null,
    meta_description: null,
    focus_keyword: null,
    seo_ai_report: null
  };
}
