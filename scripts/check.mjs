import { readFile, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import assert from "node:assert/strict";

const html = await readFile("index.html", "utf8");
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "HTML IDs must be unique");
assert.equal(
  [...html.matchAll(/<h1\b/g)].length,
  1,
  "The page needs one main heading",
);
assert.match(html, /<html lang="en">/, "Set the document language");
assert.match(html, /name="viewport"/, "Include a responsive viewport");

const localFiles = new Set();
for (const [, url] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
  if (url.startsWith("#")) {
    assert.ok(
      url === "#" || ids.includes(url.slice(1)),
      `Missing anchor: ${url}`,
    );
  } else if (!/^[a-z]+:/i.test(url)) {
    localFiles.add(url);
  } else {
    assert.ok(
      url.startsWith("https://"),
      `Use HTTPS for external links: ${url}`,
    );
  }
}
for (const [, url] of (await readFile("script.js", "utf8")).matchAll(
  /['"](assets\/[^'"]+)['"]/g,
))
  localFiles.add(url);
for (const file of localFiles) {
  assert.ok(
    resolve(file).startsWith(resolve(".") + sep),
    `Asset must stay in this project: ${file}`,
  );
  assert.ok((await stat(file)).isFile(), `Missing local file: ${file}`);
}
for (const [image] of html.matchAll(/<img\b[^>]*>/g)) {
  assert.match(
    image,
    /\balt="[^"]*"/,
    "Every image needs alt text (empty for decoration)",
  );
  assert.match(
    image,
    /\bwidth="\d+"/,
    "Set image dimensions to avoid layout shift",
  );
  assert.match(
    image,
    /\bheight="\d+"/,
    "Set image dimensions to avoid layout shift",
  );
}
const script = await readFile("script.js", "utf8");
assert.doesNotMatch(
  html,
  /<script[^>]+src="https?:/i,
  "Keep the site free of remote scripts",
);
assert.doesNotMatch(
  script,
  /\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/,
  "The landing page needs no background network requests",
);
console.log(
  `PASS: ${ids.length} unique anchors and icons, ${localFiles.size} local assets, image accessibility, and no remote scripts.`,
);
