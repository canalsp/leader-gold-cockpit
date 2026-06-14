/**
 * Prepara pasta dist/ para @vercel/static-build na Vercel.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const publicSrc = path.join(root, "public");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
copyDir(publicSrc, path.join(dist, "public"));

const faviconPng = path.join(dist, "public", "favicon.png");
if (fs.existsSync(faviconPng)) {
  fs.copyFileSync(faviconPng, path.join(dist, "favicon.ico"));
}

console.info("[vercel-build] dist/ pronto:", fs.readdirSync(dist).join(", "));
