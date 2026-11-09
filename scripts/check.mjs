import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import assert from "node:assert/strict";
import { OFFICIAL_ACCOUNT_URL } from "./account-links.mjs";
import { REGIONS, applyRegions, loadManifest, redirectRules, regionNames } from "./release.mjs";

const SITE = "https://ultratasks.app";
// The one address the privacy policy gives for questions and data requests.
const CONTACT_LINK = "mailto:hi@ultratasks.app";
const isFile = async (file) => (await stat(file).catch(() => null))?.isFile() ?? false;

// The site is the home page, the download page, the 404 page, and every guide
// under guides/. Each guide lives at guides/<slug>/index.html, so it is served
// at /guides/<slug>/.
const guideEntries = (await readdir("guides", { recursive: true })).map((entry) =>
  entry.replaceAll("\\", "/"),
);
const strayHtml = guideEntries.filter(
  (entry) => entry.endsWith(".html") && !/(^|\/)index\.html$/.test(entry),
);
assert.deepEqual(
  strayHtml,
  [],
  `Name every guide page index.html inside its own folder: ${strayHtml.join(", ")}`,
);
const pages = [
  { file: "index.html", url: "/", indexable: true },
  { file: "download/index.html", url: "/download/", indexable: true },
  { file: "privacy-policy/index.html", url: "/privacy-policy/", indexable: true },
  { file: "404.html", url: null, indexable: false },
  ...guideEntries
    .filter((entry) => entry.endsWith("index.html"))
    .map((entry) => ({
      file: `guides/${entry}`,
      url: `/guides/${entry.slice(0, -"index.html".length)}`,
      indexable: true,
    })),
];
for (const page of pages) {
  page.html = await readFile(page.file, "utf8");
  page.ids = [...page.html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
}
const home = pages[0];
const downloadPage = pages.find((page) => page.file === "download/index.html");
const script = await readFile("script.js", "utf8");

// The current release (data/release.json) and the stable download addresses it
// produces. A link to /download/windows is not a file in this project, so it is
// checked against the redirect rules instead.
const manifest = await loadManifest();
const rules = redirectRules(manifest);
const redirectPaths = new Set(rules.map((rule) => rule.from));
assert.equal(redirectPaths.size, rules.length, "Download addresses must be unique");

const localFiles = new Set();
const titles = new Set();
const descriptions = new Set();
const footerNotes = new Set();
const footerNote = (html) =>
  html
    .match(/<p class="footer-note" id="site-analytics">([\s\S]*?)<\/p>/)?.[1]
    .replace(/\s+/g, " ")
    .trim();

for (const page of pages) {
  const { file, html, ids } = page;
  const where = ` (${file})`;

  // Structure.
  assert.equal(new Set(ids).size, ids.length, `HTML IDs must be unique${where}`);
  assert.equal(
    [...html.matchAll(/<h1\b/g)].length,
    1,
    `Each page needs one main heading${where}`,
  );
  assert.match(html, /<html lang="en">/, `Set the document language${where}`);
  assert.match(html, /name="viewport"/, `Include a responsive viewport${where}`);
  assert.doesNotMatch(
    html,
    /<script[^>]+src="https?:/i,
    `Keep the site free of remote scripts${where}`,
  );

  // Links and assets. The home page may use relative links; every other page is
  // served from a different folder (or at a mistyped address), so it must use
  // root-absolute ones.
  for (const [, url] of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    if (url.startsWith("#")) {
      assert.ok(
        url === "#" || ids.includes(url.slice(1)),
        `Missing anchor: ${url}${where}`,
      );
      continue;
    }
    if (/^[a-z]+:/i.test(url)) {
      assert.ok(
        url.startsWith("https://") || url === CONTACT_LINK,
        `Use HTTPS for external links: ${url}${where}`,
      );
      continue;
    }
    const [withoutFragment, fragment] = url.split("#");
    const path = withoutFragment.split("?")[0];
    let target;
    if (path.startsWith("/download/") && path !== "/download/") {
      assert.ok(redirectPaths.has(path), `Unknown download address: ${url}${where}`);
      continue;
    }
    if (url.startsWith("/")) {
      assert.ok(!url.startsWith("//"), `Unexpected protocol-relative link: ${url}${where}`);
      target = path.endsWith("/") ? `${path.slice(1)}index.html` : path.slice(1);
    } else {
      assert.equal(
        file,
        "index.html",
        `Use root-absolute links outside the home page: ${url}${where}`,
      );
      target = path;
    }
    assert.ok(
      resolve(target).startsWith(resolve(".") + sep),
      `Asset must stay in this project: ${url}${where}`,
    );
    assert.ok(
      await isFile(target),
      `Missing local file: ${url}${where}. Link to folders with a trailing slash.`,
    );
    if (fragment && target.endsWith(".html")) {
      const linked = pages.find((other) => other.file === target);
      assert.ok(linked?.ids.includes(fragment), `Missing anchor: ${url}${where}`);
    }
    localFiles.add(target);
  }

  for (const [image] of html.matchAll(/<img\b[^>]*>/g)) {
    assert.match(image, /\balt="[^"]*"/, `Every image needs alt text${where}`);
    assert.match(image, /\bwidth="\d+"/, `Set image dimensions${where}`);
    assert.match(image, /\bheight="\d+"/, `Set image dimensions${where}`);
  }

  // Search basics.
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1].trim();
  assert.ok(title, `The page needs a <title>${where}`);
  assert.ok(title.length <= 70, `Keep the title under 70 characters (${title.length})${where}`);
  assert.ok(!titles.has(title), `Give each page its own title${where}`);
  titles.add(title);
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)?.[1];
  assert.ok(description, `The page needs a meta description${where}`);
  // The 404 page is never shown in search results, so its length does not matter.
  assert.ok(
    !page.indexable || (description.length >= 70 && description.length <= 160),
    `Keep the description between 70 and 160 characters (${description.length})${where}`,
  );
  assert.ok(!descriptions.has(description), `Give each page its own description${where}`);
  descriptions.add(description);

  if (page.indexable) {
    assert.doesNotMatch(html, /noindex/, `An indexable page must not say noindex${where}`);
    // Match across line breaks: the markup is wrapped by the formatter.
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1];
    assert.equal(
      canonical,
      `${SITE}${page.url}`,
      `Set the canonical URL to ${SITE}${page.url}${where}`,
    );
    const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/)?.[1];
    if (ogUrl) {
      assert.equal(ogUrl, canonical, `og:url must match the canonical URL${where}`);
    }
    const jsonLd = [
      ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
    ];
    assert.ok(jsonLd.length > 0, `Include structured data${where}`);
    for (const [, json] of jsonLd) JSON.parse(json);
  } else {
    // The 404 page is served at whatever address was mistyped, so it must stay
    // out of search results.
    assert.match(
      html,
      /<meta name="robots" content="noindex"/,
      `Keep this page out of search results${where}`,
    );
  }

  // The privacy promise: every page discloses the website's visit counter, in
  // exactly the same words.
  const note = footerNote(html);
  assert.ok(note, `Every page needs the "About this website" footer note${where}`);
  footerNotes.add(note);
}
assert.equal(
  footerNotes.size,
  1,
  "The analytics footer note must be identical on every page",
);

// Downloads. Every file link goes through a stable /download/ address, so a
// release only changes data/release.json and the generated blocks, and the
// links never point at a GitHub page by accident.
for (const page of pages) {
  assert.doesNotMatch(
    page.html,
    /github\.com\/[^"]*\/releases\/(?:latest|download)\b/,
    `Link to /download/<name> instead of a GitHub release file (${page.file})`,
  );
}
assert.deepEqual(
  [...regionNames(downloadPage.html)].sort(),
  [...REGIONS].sort(),
  "download/index.html must contain each generated release block exactly once",
);
assert.equal(
  applyRegions(downloadPage.html, manifest),
  downloadPage.html,
  "download/index.html is out of date with data/release.json. Run: npm run release:render",
);
assert.equal(
  home.html.match(/"softwareVersion":\s*"([^"]*)"/)?.[1],
  manifest.app.version,
  "The home page's softwareVersion must match data/release.json. Run: npm run release:render",
);
assert.deepEqual(
  [...new Set(home.html.match(/\b\d+\.\d+\.\d+\b/g) ?? [])],
  [manifest.app.version],
  "The home page mentions a version other than the current release",
);
// Platforms that are not published say so, instead of offering a dead button.
for (const platform of ["ios", "web"]) {
  assert.match(
    downloadPage.html,
    new RegExp(`id="${platform}"[\\s\\S]*?Coming soon`),
    `The ${platform} card must say "Coming soon"`,
  );
}

// Every navigation bar carries the same two calls to action: the sign-in link
// for UltraSync (hidden by the build when no account server is set) and Download.
for (const page of pages.filter((candidate) => candidate.html.includes('id="main-navigation"'))) {
  const sign = page.html.match(
    /<a\s+href="([^"]+)"\s+data-account-link="login"\s+hidden>Sign in<\/a>/,
  );
  assert.ok(sign, `The navigation needs the Sign in link (${page.file})`);
  assert.equal(
    sign[1],
    `${OFFICIAL_ACCOUNT_URL}/account?view=login`,
    `The Sign in placeholder should name the official dashboard (${page.file})`,
  );
  assert.match(
    page.html,
    /<a class="button button-small" href="\/download\/"/,
    `The Download button must open the download page (${page.file})`,
  );
}

// The privacy policy. It makes promises (no analytics in the apps, nothing
// readable on the sync server, the website's one visit counter), so the page
// must keep making them, and every footer with links must reach it.
const privacyPage = pages.find((page) => page.file === "privacy-policy/index.html");
const privacyText = privacyPage.html
  .replace(/<script[\s\S]*?<\/script>/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/\s+/g, " ");
for (const [claim, pattern] of [
  ["the apps have no analytics", /apps have no analytics/i],
  ["the website's only analytics is Cloudflare Web Analytics", /only analytics we (?:use|run)/i],
  ["we cannot view tasks or synced data", /cannot view your tasks, nor any data you choose to sync with us/i],
  ["we hold no keys", /do not have your keys/i],
  ["the email address and encrypted data we store", /Your email address[\s\S]*Your encrypted account data/i],
  ["what encryption does not hide", /What encryption does not hide/i],
  ["the desktop update check", /update check[\s\S]*GitHub/i],
  ["stores collect their own data", /store collects its own information/i],
  ["account deletion", /delete your account yourself/i],
  ["we cannot recover login credentials", /cannot recover your login credentials/i],
  ["requests are verified before we act", /verified that the request really comes from you/i],
  ["the hosting and email providers", /Oracle Cloud[\s\S]*Purelymail/],
  ["how to get in touch", /\bContact\b[\s\S]*hi@ultratasks\.app[\s\S]*GitHub/],
]) {
  assert.match(privacyText, pattern, `The privacy policy must still state: ${claim}`);
}
for (const page of pages.filter((candidate) => candidate.html.includes('class="footer-links"'))) {
  assert.match(
    page.html,
    /<a href="\/privacy-policy\/"[^>]*>Privacy policy<\/a>/,
    `The footer needs a Privacy policy link (${page.file})`,
  );
}
assert.match(
  downloadPage.html,
  /href="\/privacy-policy\/"/,
  "The download page must link to the privacy policy",
);
assert.match(
  privacyPage.html,
  /<a href="mailto:hi@ultratasks\.app">hi@ultratasks\.app<\/a>/,
  "The privacy policy must link its contact address",
);

// Files the home page script refers to.
for (const [, url] of script.matchAll(/['"](assets\/[^'"]+)['"]/g)) {
  assert.ok(await isFile(url), `Missing local file: ${url}`);
  localFiles.add(url);
}
assert.doesNotMatch(
  script,
  /\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(/,
  "The landing page needs no background network requests",
);

// Crawler files: robots.txt points at the sitemap, and the sitemap lists every
// indexable page (and nothing else).
const robots = await readFile("robots.txt", "utf8");
assert.match(robots, /^Sitemap: https:\/\//m, "robots.txt should list the sitemap");
const sitemap = await readFile("sitemap.xml", "utf8");
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const expected = pages.filter((page) => page.indexable).map((page) => `${SITE}${page.url}`);
assert.deepEqual(
  [...listed].sort(),
  [...expected].sort(),
  "sitemap.xml must list every indexable page, and only those",
);

const guideCount = pages.filter((page) => page.url?.startsWith("/guides/")).length;
console.log(
  `PASS: ${pages.length} pages (${guideCount} in guides), ${localFiles.size} local files, ${rules.length} download addresses for ${manifest.app.version}, unique titles, one analytics note, a safe 404 page, a complete sitemap, and no remote scripts.`,
);
