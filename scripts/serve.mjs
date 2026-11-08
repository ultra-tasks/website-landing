import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { loadManifest, redirectRules } from "./release.mjs";

const root = resolve(process.argv[2] || ".");
// Like Cloudflare Pages' `_redirects`: /download/windows and friends redirect to
// the files on the current release. The rules come from data/release.json.
const redirects = new Map(
  redirectRules(await loadManifest()).map((rule) => [rule.from, rule.to]),
);
const port = Number(process.env.PORT || 4321);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

// Like Cloudflare Pages: unknown addresses get 404.html with a real 404 status.
function notFound(res) {
  const page = resolve(root, "404.html");
  stat(page)
    .then(() => {
      res.writeHead(404, {
        "Content-Type": types[".html"],
        "Cache-Control": "no-cache",
      });
      createReadStream(page).pipe(res);
    })
    .catch(() => res.writeHead(404).end("Not found"));
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    if (redirects.has(pathname)) {
      res.writeHead(302, { Location: redirects.get(pathname) }).end();
      return;
    }
    let file = resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    let info;
    try {
      info = await stat(file);
      // Like Cloudflare Pages: a folder serves its index.html, and the folder
      // address without a trailing slash redirects to the one with it.
      if (info.isDirectory()) {
        if (!pathname.endsWith("/")) {
          res.writeHead(308, { Location: `${pathname}/${url.search}` }).end();
          return;
        }
        file = resolve(file, "index.html");
        info = await stat(file);
      }
    } catch {
      if (!extname(file) && process.env.SPA === "1") {
        file = resolve(root, "index.html");
        info = await stat(file);
      } else {
        notFound(res);
        return;
      }
    }
    if (!info.isFile()) {
      notFound(res);
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(400).end("Bad request");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`Local: http://127.0.0.1:${port}`),
);
