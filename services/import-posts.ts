import { mysqlPool } from "../lib/mysql.js";
import { mapMysqlPostToSupabase } from "../lib/post-mapper.js";
import { postsTable, supabase } from "../lib/supabase.js";
import type { MysqlPostRow, SupabasePostInsert } from "../types/post.js";

function mysqlPostsTableName(): string {
  const raw = process.env.MYSQL_POSTS_TABLE ?? "posts";
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(raw)) {
    throw new Error("MYSQL_POSTS_TABLE inválido (use só letras, números e _)");
  }
  return raw;
}

export async function importPostsFromMysql(limit?: number): Promise<{
  totalFetched: number;
  totalImported: number;
}> {
  const postsTableMysql = mysqlPostsTableName();
  const query = `
    SELECT
      id,
      title,
      slug,
      excerpt,
      content,
      featured_image,
      author_id,
      status,
      source,
      source_url,
      view_count,
      created_at,
      updated_at
    FROM ${postsTableMysql}
    ORDER BY id ASC
    ${typeof limit === "number" ? "LIMIT ?" : ""}
  `;

  const [rows] = typeof limit === "number"
    ? await mysqlPool.query<MysqlPostRow[]>(query, [limit])
    : await mysqlPool.query<MysqlPostRow[]>(query);

  const mapped: SupabasePostInsert[] = rows.map(mapMysqlPostToSupabase);
  if (mapped.length === 0) {
    return { totalFetched: 0, totalImported: 0 };
  }

  const { error } = await supabase
    .from(postsTable)
    .upsert(mapped, { onConflict: "legacy_id" });

  if (error) {
    throw new Error(
      `Supabase import failed: ${error.message || "unknown error"} (code: ${error.code || "n/a"}, details: ${error.details || "n/a"}, hint: ${error.hint || "n/a"})`
    );
  }

  return {
    totalFetched: rows.length,
    totalImported: mapped.length
  };
}
