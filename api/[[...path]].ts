import type { VercelRequest, VercelResponse } from "@vercel/node";
import { dispatchApi } from "../lib/api-router.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const handled = await dispatchApi(req, res);
    if (!handled) {
      return res.status(404).json({ error: "Rota api nao encontrada" });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno";
    return res.status(500).json({ error: msg });
  }
}
