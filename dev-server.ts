/**
 * Servidor local: UI estática + todas as rotas /api/* (auth, posts, dashboard, público, etc.).
 * Substitui o stub que só devolvia SPA e fazia POST retornar 405.
 *
 * Uso: na pasta admin/cockpit rodar `npm run dev`
 * Por padrão escuta PORT ou 3100 (alinhar com proxy do Vite no site).
 */
import "./load-env.js";

import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { dispatchApi } from "./lib/api-router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const port = Number(process.env.PORT) || 3100;
const root = __dirname;

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

function safeFilePath(urlPath: string): string | null {
  const rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel.includes("\0")) return null;
  const normalized = path.normalize(rel).replace(/^(\.\.[\\/])+/, "");
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

function normalizeApiPath(urlPath: string): string {
  const p = urlPath.split("?")[0]?.replace(/\/$/, "") || "";
  return p || "/";
}

function adaptRequest(nodeReq: http.IncomingMessage, bodyBuf: Buffer): VercelRequest {
  const host = nodeReq.headers.host || "localhost";
  const rawUrl = String(nodeReq.url || "/");
  const url = new URL(rawUrl.startsWith("/") ? `http://${host}${rawUrl}` : rawUrl);
  let body: Record<string, unknown> = {};
  const ct = String(nodeReq.headers["content-type"] || "");
  if (bodyBuf.length > 0 && ct.includes("application/json")) {
    try {
      const parsed = JSON.parse(bodyBuf.toString("utf8")) as unknown;
      body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    } catch {
      body = {};
    }
  }

  const queryRaw = Object.fromEntries(url.searchParams.entries());

  const vercelReq = {
    method: nodeReq.method || "GET",
    url: nodeReq.url || "/",
    headers: nodeReq.headers,
    query: queryRaw as VercelRequest["query"],
    body,
    rawBody: bodyBuf,
  };

  Object.defineProperty(vercelReq, "query", { value: queryRaw, enumerable: true });
  return vercelReq as unknown as VercelRequest;
}

function adaptResponse(nodeRes: http.ServerResponse): VercelResponse {
  let statusCodeForSend = 200;
  let headersSentExplicitly = false;

  function applyHeaders(from: Record<string, string | undefined>) {
    for (const [k, v] of Object.entries(from)) {
      if (v !== undefined && v !== "") {
        headersSentExplicitly = true;
        nodeRes.setHeader(k, v);
      }
    }
  }

  const chain = {
    status(code: number) {
      statusCodeForSend = code;
      nodeRes.statusCode = code;
      return chain as unknown as VercelResponse;
    },
    setHeader(name: string, value: string | number | ReadonlyArray<string>) {
      nodeRes.setHeader(name, value);
      headersSentExplicitly = true;
      return chain as unknown as VercelResponse;
    },
    getHeader(name: string) {
      return nodeRes.getHeader(name);
    },
    redirect(status: number, dest: string) {
      chain.status(status);
      nodeRes.setHeader("Location", dest);
      headersSentExplicitly = true;
      nodeRes.end();
      return chain as unknown as VercelResponse;
    },
    json(obj: unknown) {
      if (!headersSentExplicitly || !nodeRes.getHeader("content-type")) {
        nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
      }
      nodeRes.statusCode = statusCodeForSend;
      nodeRes.end(JSON.stringify(obj));
      return chain as unknown as VercelResponse;
    },
    send(body: unknown) {
      nodeRes.statusCode = statusCodeForSend;
      if (typeof body === "string" || Buffer.isBuffer(body)) {
        nodeRes.end(body);
      } else {
        nodeRes.setHeader("Content-Type", "application/json; charset=utf-8");
        nodeRes.end(JSON.stringify(body));
      }
      return chain as unknown as VercelResponse;
    },
    end(chunk?: unknown) {
      nodeRes.statusCode = statusCodeForSend;
      if (chunk !== undefined && chunk !== null && typeof chunk !== "function") {
        nodeRes.end(String(chunk));
      } else if (!nodeRes.writableEnded) {
        nodeRes.end();
      }
      return chain as unknown as VercelResponse;
    },
    writableEnded: false as boolean,
    setHeaders(_headers: http.OutgoingHttpHeaders) {
      return chain as unknown as VercelResponse;
    },
    writeHead(code: number, headers?: http.OutgoingHttpHeaders) {
      statusCodeForSend = code;
      nodeRes.statusCode = code;
      if (headers) applyHeaders(headers as Record<string, string | undefined>);
      return chain as unknown as VercelResponse;
    },
  };

  nodeRes.once("finish", () => {
    (chain as { writableEnded: boolean }).writableEnded = true;
  });

  return chain as unknown as VercelResponse;
}

async function readBody(req: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const ch of req) {
    chunks.push(Buffer.isBuffer(ch) ? ch : Buffer.from(ch));
  }
  return Buffer.concat(chunks);
}

async function handleApi(req: http.IncomingMessage, res: http.ServerResponse, pathname: string, bodyBuf: Buffer) {
  const vercelReq = adaptRequest(req, bodyBuf);
  if (!vercelReq.url?.startsWith("/api")) {
    vercelReq.url = pathname + (req.url?.includes("?") ? "?" + req.url.split("?")[1] : "");
  }
  const vercelRes = adaptResponse(res);
  return dispatchApi(vercelReq, vercelRes);
}

function sendStatic(req: http.IncomingMessage, res: http.ServerResponse): void {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end();
    return;
  }

  let filePath = safeFilePath(req.url === "/" ? "/index.html" : req.url || "/");
  if (!filePath) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const sendFile = (p: string): void => {
    fs.stat(p, (err, st) => {
      if (err || !st.isFile()) {
        res.statusCode = 404;
        res.end();
        return;
      }
      const ext = path.extname(p).toLowerCase();
      res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
      if (req.method === "HEAD") {
        res.end();
        return;
      }
      fs.createReadStream(p).pipe(res);
    });
  };

  fs.stat(filePath, (err, st) => {
    if (!err && st.isDirectory()) {
      sendFile(path.join(filePath, "index.html"));
      return;
    }
    if (!err && st.isFile()) {
      sendFile(filePath);
      return;
    }
    sendFile(path.join(root, "index.html"));
  });
}

async function router(req: http.IncomingMessage, res: http.ServerResponse) {
  const raw = req.url || "/";
  const pathname = normalizeApiPath(raw.split("?")[0]);

  if (pathname.startsWith("/api/")) {
    const bodyBuf = req.method?.toUpperCase() === "GET" || req.method?.toUpperCase() === "HEAD" ? Buffer.alloc(0) : await readBody(req);
    try {
      const ok = await handleApi(req, res, pathname, bodyBuf);
      if (!ok) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify({ error: "Rota api nao encontrada" }));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro interno";
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: msg }));
    }
    return;
  }

  sendStatic(req, res);
}

const server = http.createServer((req, res) => {
  void router(req, res);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `[cockpit] Porta ${port} ja esta em uso.\n` +
        `  Feche o outro "npm run dev" ou execute:\n` +
        `  netstat -ano | findstr :${port}\n` +
        `  taskkill /PID <numero> /F\n` +
        `  Ou defina PORT=3101 no .env e ajuste VITE_COCKPIT_PROXY_TARGET no site.`,
    );
    process.exit(1);
  }
  console.error("[cockpit] Erro ao iniciar servidor:", err.message);
  process.exit(1);
});

server.listen(port, "127.0.0.1", () => {
  console.info(`[cockpit] UI + APIs em http://127.0.0.1:${port}`);
});
