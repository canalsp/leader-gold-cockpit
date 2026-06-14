/**
 * Garante favicon.ico na raiz para browsers que pedem /favicon.ico
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const faviconPng = path.join(projectRoot, "public", "favicon.png");
const faviconIco = path.join(projectRoot, "favicon.ico");

if (fs.existsSync(faviconPng)) {
  fs.copyFileSync(faviconPng, faviconIco);
  console.info("[vercel-static] favicon.ico criado na raiz");
} else {
  console.warn("[vercel-static] public/favicon.png nao encontrado");
}
