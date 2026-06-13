/**
 * Carrega admin/cockpit/.env antes de qualquer módulo que leia process.env (ex.: supabase.ts).
 * Deve ser importado como primeira linha em dev-server.ts.
 */
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(dir, ".env");

if (!fs.existsSync(envPath)) {
  console.error(
    `[cockpit] Arquivo .env nao encontrado em:\n  ${envPath}\n` +
      `  Copie .env.example para .env e preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.`,
  );
} else {
  const result = config({ path: envPath });
  if (result.error) {
    console.error("[cockpit] Erro ao ler .env:", result.error.message);
  }
}
