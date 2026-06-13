import type { VercelRequest, VercelResponse } from "@vercel/node";
import { applyPublicCors, preflightPublic } from "../../lib/cors-public.js";
import { CHAT_SYSTEM_PROMPT } from "../../lib/chat-prompt.js";

type HistoryItem = { role: "user" | "assistant"; content: string };

function normalizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as HistoryItem).role;
    const content = String((item as HistoryItem).content ?? "").trim();
    if ((role !== "user" && role !== "assistant") || !content) continue;
    if (content.length > 4000) continue;
    out.push({ role, content });
  }
  return out.slice(-12);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  applyPublicCors(res);
  if (preflightPublic(req.method, res)) {
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(503).json({
      error: "Chat indisponivel",
      detail: "OPENAI_API_KEY nao configurada no servidor do cockpit.",
    });
  }

  const honeypot = String(req.body?.website ?? "").trim();
  if (honeypot) {
    return res.status(400).json({ error: "Requisicao invalida" });
  }

  const message = String(req.body?.message ?? "").trim();
  if (!message || message.length < 1 || message.length > 2000) {
    return res.status(400).json({ error: "Mensagem invalida" });
  }

  const history = normalizeHistory(req.body?.history);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: CHAT_SYSTEM_PROMPT },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: message },
  ];

  let r: Response;
  try {
    r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 600,
        messages,
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch falhou";
    return res.status(502).json({ error: "Nao foi possivel contactar a OpenAI", detail: msg });
  }

  if (!r.ok) {
    const t = await r.text();
    let apiMessage = t.slice(0, 500);
    try {
      const j = JSON.parse(t) as { error?: { message?: string } };
      if (j.error?.message) apiMessage = j.error.message;
    } catch {
      /* ignora */
    }
    const clientStatus = r.status === 429 ? 429 : 502;
    return res.status(clientStatus).json({
      error: "OpenAI falhou",
      detail: apiMessage,
      openai_http_status: r.status,
    });
  }

  const json = (await r.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!reply) {
    return res.status(502).json({ error: "Resposta vazia da OpenAI" });
  }

  return res.status(200).json({ ok: true, reply });
}
