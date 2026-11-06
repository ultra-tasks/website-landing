import { cp, mkdir, rm } from "node:fs/promises";

// Start clean so files removed from the source never linger in a local build.
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "script.js",
  "assets",
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log("Built static website in dist/");
