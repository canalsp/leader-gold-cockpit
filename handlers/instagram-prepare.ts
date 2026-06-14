import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cropForInstagram, fetchImageBuffer, type InstagramFormat } from "../lib/instagram-image.js";
import { requireAuth } from "../lib/require-auth.js";

type ChatMessage = { role: "system" | "user"; content: string };

function siteOrigin(): string {
  const raw = process.env.PUBLIC_SITE_ORIGIN?.trim();
  return raw || "https://www.leaderti.com.br";
}

function parseFormat(raw: unknown): InstagramFormat {
  return raw === "story" ? "story" : "feed";
}

async function generateCaption(input: {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  categories: string[];
  blogUrl: string;
}): Promise<{ caption: string; hashtags: string }> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const short = input.excerpt || input.title;
    const tags = ["#LeaderIT", "#AutomacaoComIA", "#Tecnologia", "#Blog"];
    return {
      caption: `${input.title}\n\n${short}\n\nNovo artigo no blog Leader I.T.`,
      hashtags: tags.join(" "),
    };
  }

  const system: ChatMessage = {
    role: "system",
    content:
      "Voce cria legendas para Instagram em portugues brasileiro para uma empresa B2B de tecnologia (Leader I.T). " +
      "Responda em JSON valido com: caption (max 900 chars, tom profissional e envolvente, 2-4 paragrafos curtos, " +
      "sem hashtags dentro do caption, inclua CTA para ler no blog), hashtags (string com 8 a 15 hashtags separadas por espaco, " +
      "misture nicho + tema do post). Instagram feed nao tem link clicavel — mencione link na bio de forma sutil no caption.",
  };

  const user: ChatMessage = {
    role: "user",
    content: JSON.stringify({
      title: input.title,
      excerpt: input.excerpt,
      tags: input.tags,
      categories: input.categories,
      blog_url: input.blogUrl,
      content_sample: input.content.slice(0, 8000),
    }),
  };

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.6,
      messages: [system, user],
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OpenAI falhou ao gerar legenda (${r.status}): ${t.slice(0, 300)}`);
  }

  const json = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
  let raw = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```\s*$/, "").trim();
  }

  let parsed: { caption?: string; hashtags?: string };
  try {
    parsed = JSON.parse(raw) as { caption?: string; hashtags?: string };
  } catch {
    return {
      caption: raw.slice(0, 900),
      hashtags: "#LeaderIT #AutomacaoComIA #Tecnologia",
    };
  }
  return {
    caption: String(parsed.caption ?? "").trim(),
    hashtags: String(parsed.hashtags ?? "").trim(),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAuth(req, res)) {
    return;
  }

  const title = String(req.body?.title ?? "").trim();
  const slug = String(req.body?.slug ?? "").trim();
  const excerpt = String(req.body?.excerpt ?? "").trim();
  const content = String(req.body?.content ?? "").trim();
  const featuredImage = String(req.body?.featured_image ?? "").trim();
  const format = parseFormat(req.body?.format);
  const tags = Array.isArray(req.body?.tags)
    ? req.body.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
    : [];
  const categories = Array.isArray(req.body?.categories)
    ? req.body.categories.map((t: unknown) => String(t).trim()).filter(Boolean)
    : [];

  if (!title) {
    return res.status(400).json({ error: "title obrigatorio" });
  }
  if (!featuredImage) {
    return res.status(400).json({ error: "Envie uma imagem destacada antes de gerar o pacote Instagram" });
  }

  const blogUrl = slug
    ? `${siteOrigin()}/blog/${encodeURIComponent(slug)}`
    : siteOrigin();

  try {
    const source = await fetchImageBuffer(featuredImage);
    const cropped = await cropForInstagram(source, format);
    const { caption, hashtags } = await generateCaption({
      title,
      excerpt,
      content,
      tags,
      categories,
      blogUrl,
    });

    const generatedAt = new Date().toISOString();
    const draft = {
      format,
      caption,
      hashtags,
      blog_url: blogUrl,
      generated_at: generatedAt,
      image_width: cropped.width,
      image_height: cropped.height,
    };

    return res.status(200).json({
      ok: true,
      draft,
      caption,
      hashtags,
      blog_url: blogUrl,
      format,
      image_base64: cropped.buffer.toString("base64"),
      image_mime: cropped.mime,
      image_width: cropped.width,
      image_height: cropped.height,
      hint: "Revise a legenda, baixe a imagem e publique manualmente no Instagram (feed ou story).",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao preparar pacote Instagram";
    return res.status(500).json({ error: msg });
  }
}
