import { configureAccountLinks, resolveAccountUrl } from "./account-links.mjs";
import { loadManifest, redirectsText } from "./release.mjs";
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";

// Start clean so files removed from the source never linger in a local build.
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
for (const file of [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "assets",
  "download",
  "guides",
  "privacy-policy",
  "robots.txt",
  "sitemap.xml",
]) {
  await cp(file, `dist/${file}`, { recursive: true });
}

// The stable download addresses (/download/windows, ...) are redirects to the
// files on the current GitHub release. Cloudflare Pages reads `_redirects`.
await writeFile("dist/_redirects", redirectsText(await loadManifest()));

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
const pages = (await readdir("dist", { recursive: true }))
  .map((entry) => entry.replaceAll("\\", "/"))
  .filter((entry) => entry.endsWith(".html"));
for (const page of pages) {
  let html = await readFile(`dist/${page}`, "utf8");
  for (const [file, hash] of Object.entries(hashes)) {
    // Relative ("styles.css") and root-absolute ("/styles.css") references.
    for (const reference of [`="${file}"`, `="/${file}"`]) {
      html = html.replaceAll(reference, `="${reference.slice(2, -1)}?v=${hash}"`);
    }
  }
  // The 404 page has no script. Every other page needs both files.
  const expected = page === "404.html" ? ["styles.css"] : ["styles.css", "script.js"];
  for (const file of expected) {
    if (!html.includes(`${file}?v=${hashes[file]}`)) {
      throw new Error(`${page} does not reference ${file}, so it cannot be versioned.`);
    }
  }
  // Anything that is still unversioned (for example "../styles.css" in a guide)
  // would be cached for four hours under a name that later changes.
  const leftover = html.match(/(?:src|href)="[^"]*(?:styles\.css|script\.js)"/);
  if (leftover) {
    throw new Error(`${page} has an unversioned reference: ${leftover[0]}`);
  }
  await writeFile(`dist/${page}`, html);
}
console.log(
  `Built ${pages.length} pages in dist/ (styles.css?v=${hashes["styles.css"]}, script.js?v=${hashes["script.js"]})`,
);

const accountUrl = resolveAccountUrl(process.env.PUBLIC_ACCOUNT_URL);
await configureAccountLinks("dist", accountUrl);
console.log(
  accountUrl ? `Sign-in links lead to ${accountUrl}/account` : "Sign-in links are hidden",
);
