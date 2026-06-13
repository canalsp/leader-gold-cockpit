import type { RowDataPacket } from "mysql2";

export type PostStatus = "draft" | "published" | "scheduled";

export type MysqlPostRow = RowDataPacket & {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  author_id: number | null;
  status: "draft" | "published";
  source: string | null;
  source_url: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
};

export type SupabasePostInsert = {
  legacy_id?: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  author_legacy_id: number | null;
  author_name?: string | null;
  tags?: string[];
  categories?: string[];
  status: string;
  source: string | null;
  source_url: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  seo_ai_report?: string | null;
};
