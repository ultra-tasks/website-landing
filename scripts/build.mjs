import { configureAccountLinks } from "./account-links.mjs";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";

// Start clean so files removed from the source never linger in a local build.
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "assets",
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(file, `dist/${file}`, { recursive: true });
}

// Browsers keep styles.css and script.js for four hours under the same name. A
// visitor who loaded the previous version would then pair the new page with the
// old stylesheet and see a broken layout. Stamp each file's content hash into
// the page's references, so every change gets a new address. The HTML itself is
// always revalidated, so it is safe to leave unversioned.
const hashes = {};
for (const file of ["styles.css", "script.js"]) {
  const bytes = await readFile(`dist/${file}`);
  hashes[file] = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
}
for (const [page, expected] of [
  ["index.html", ["styles.css", "script.js"]],
  ["404.html", ["styles.css"]],
]) {
  let html = await readFile(`dist/${page}`, "utf8");
  for (const [file, hash] of Object.entries(hashes)) {
    // Relative ("styles.css") and root-absolute ("/styles.css") references.
    for (const reference of [`="${file}"`, `="/${file}"`]) {
      html = html.replaceAll(reference, `="${reference.slice(2, -1)}?v=${hash}"`);
    }
  }
  for (const file of expected) {
    if (!html.includes(`${file}?v=${hashes[file]}`)) {
      throw new Error(`${page} does not reference ${file}, so it cannot be versioned.`);
    }
  }
  await writeFile(`dist/${page}`, html);
}
console.log(
  `Built static website in dist/ (styles.css?v=${hashes["styles.css"]}, script.js?v=${hashes["script.js"]})`,
);

await configureAccountLinks("dist", process.env.PUBLIC_ACCOUNT_URL);
