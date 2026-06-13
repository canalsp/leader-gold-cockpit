import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "node:crypto";
import { requireAuth } from "../lib/require-auth.js";
import { supabase } from "../lib/supabase.js";

function bucketName(): string {
  return process.env.SUPABASE_STORAGE_BUCKET ?? "post-images";
}

function safeFileName(name: string): string {
  const base = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return base || "image.bin";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAuth(req, res)) {
    return;
  }

  const body = req.body as {
    fileName?: string;
    mimeType?: string;
    base64?: string;
  };

  if (!body?.base64 || typeof body.base64 !== "string") {
    return res.status(400).json({ error: "base64 obrigatorio" });
  }

  const mime = typeof body.mimeType === "string" ? body.mimeType : "application/octet-stream";
  const fileName = safeFileName(typeof body.fileName === "string" ? body.fileName : "upload");

  let buffer: Buffer;
  try {
    const raw = body.base64.includes(",") ? body.base64.split(",")[1]! : body.base64;
    buffer = Buffer.from(raw, "base64");
  } catch {
    return res.status(400).json({ error: "base64 invalido" });
  }

  if (buffer.length > 6 * 1024 * 1024) {
    return res.status(400).json({ error: "Arquivo muito grande (max 6MB)" });
  }

  const key = `posts/${Date.now()}-${randomBytes(6).toString("hex")}-${fileName}`;
  const bucket = bucketName();

  const { error: upErr } = await supabase.storage.from(bucket).upload(key, buffer, {
    contentType: mime,
    upsert: false
  });

  if (upErr) {
    return res.status(500).json({
      error: "Upload falhou",
      detail: upErr.message
    });
  }

  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(key);

  return res.status(200).json({
    ok: true,
    path: key,
    publicUrl: pub.publicUrl
  });
}
