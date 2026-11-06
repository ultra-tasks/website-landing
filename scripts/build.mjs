import { cp, mkdir } from "node:fs/promises";

await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "styles.css",
  "script.js",
  "assets",
  "robots.txt",
]) {
  await cp(file, `dist/${file}`, { recursive: true });
}
console.log("Built static website in dist/");
