/**
 * Servidor estático mínimo para `vercel dev`.
 * O CLI encaminha o frontend para o devCommand; um stub que só devolve 204
 * impede o HTML de chegar ao navegador.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const port = Number(process.env.PORT) || 3000;
const root = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

function safeFilePath(urlPath) {
  const rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel.includes("\0")) return null;
  const normalized = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.join(root, normalized);
  if (!full.startsWith(root)) return null;
  return full;
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.end();
    return;
  }

  let filePath = safeFilePath(req.url === "/" ? "/index.html" : req.url);

  if (!filePath) {
    res.statusCode = 400;
    res.end();
    return;
  }

  const sendFile = (p) => {
    fs.stat(p, (err, st) => {
      if (err || !st.isFile()) {
        res.statusCode = 404;
        res.end("Not found");
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
});

server.listen(port, () => {
  console.error(`[cockpit] dev estático em http://127.0.0.1:${port}`);
});
