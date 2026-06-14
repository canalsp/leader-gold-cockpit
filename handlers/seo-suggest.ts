import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../lib/require-auth.js";

type ChatMessage = { role: "system" | "user"; content: string };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!requireAuth(req, res)) {
    return;
  }

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(400).json({
      error: "OPENAI_API_KEY nao configurada",
      detail:
        "Defina OPENAI_API_KEY (e opcionalmente OPENAI_MODEL) no ficheiro .env da pasta admin/cockpit e reinicie o servidor.",
    });
  }

  const title = String(req.body?.title ?? "").trim();
  const excerpt = String(req.body?.excerpt ?? "").trim();
  const content = String(req.body?.content ?? "").trim();
  const focus = String(req.body?.focus_keyword ?? "").trim();

  if (!title) {
    return res.status(400).json({ error: "title obrigatorio" });
  }

  const system: ChatMessage = {
    role: "system",
    content:
      "Voce e um especialista em SEO para blogs B2B em portugues brasileiro. " +
      "Nao afirme ter acessado a internet ou resultados de busca em tempo real (isso nao esta disponivel). " +
      "Baseie-se apenas no texto enviado e em boas praticas conhecidas. " +
      "Responda em JSON valido com chaves: meta_title (max 60 chars), meta_description (max 160 chars), " +
      "focus_keyword_suggestion, outline_improvements (array de strings curtas), faq_ideas (array de 2 a 4 strings)."
  };

  const user: ChatMessage = {
    role: "user",
    content: JSON.stringify({
      title,
      excerpt,
      focus_keyword: focus || null,
      content_sample: content.slice(0, 12000)
    })
  };

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
        temperature: 0.4,
        messages: [system, user],
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch falhou";
    return res.status(502).json({
      error: "Nao foi possivel contactar a OpenAI",
      detail: msg,
      hint: "Confirme que este servidor tem saida HTTPS para api.openai.com (firewall/VPN/proxy).",
    });
  }

  if (!r.ok) {
    const t = await r.text();
    let apiMessage = t.slice(0, 800);
    try {
      const j = JSON.parse(t) as { error?: { message?: string } };
      if (j.error?.message) apiMessage = j.error.message;
    } catch {
      /* texto cru */
    }
    const status = r.status;
    const hints: Record<number, string> = {
      401: "Chave invalida ou revogada: confira OPENAI_API_KEY no .env do cockpit.",
      403: "Acesso negado pela OpenAI (projeto ou modelo).",
      429:
        "Cota ou creditos esgotados na OpenAI: em platform.openai.com use Billing para adicionar saldo, ativar pagamento ou rever limites do plano.",
    };
    const hint =
      hints[status] ??
      (status >= 500
        ? "Indisponibilidade temporaria na OpenAI; tente de novo em instantes."
        : "Consulte o campo openai_http_status na resposta JSON ou o painel da OpenAI.");

    const clientStatus = status >= 500 ? 502 : status;

    return res.status(clientStatus).json({
      error: status === 429 ? "OpenAI: cota esgotada" : "OpenAI falhou",
      detail: apiMessage,
      hint,
      openai_http_status: status,
    });
  }

  const json = (await r.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  let raw = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (raw.startsWith("```")) {
    raw = raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```\s*$/, "").trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { raw };
  }

  const report =
    typeof parsed === "object" && parsed !== null
      ? JSON.stringify(parsed, null, 2)
      : raw;

  return res.status(200).json({
    ok: true,
    report,
    parsed,
    disclaimer:
      "Comparacao automatica com concorrentes na SERP exige API de busca (ex.: Google Programmable Search). Esta sugestao e baseada no conteudo enviado e em boas praticas."
  });
}
