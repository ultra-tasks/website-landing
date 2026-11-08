import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REGIONS,
  appFiles,
  applyRegions,
  escapeHtml,
  extractHighlights,
  formatDate,
  formatSize,
  loadManifest,
  redirectRules,
  redirectsText,
  regionNames,
  serverFiles,
  validateManifest,
} from "./release.mjs";

const hash = (character) => character.repeat(64);
const asset = (name, character = "a", size = 5_000_000) => ({ name, size, sha256: hash(character) });
const appNames = [
  "SHA256SUMS.txt",
  "Ultra-Tasks-9.9.9-amd64.deb",
  "Ultra-Tasks-9.9.9-Android-FDroid.apk",
  "Ultra-Tasks-9.9.9-Android.apk",
  "Ultra-Tasks-9.9.9-arm64.dmg",
  "Ultra-Tasks-9.9.9-arm64.zip",
  "Ultra-Tasks-9.9.9-Portable.exe",
  "Ultra-Tasks-9.9.9-Setup.exe",
  "Ultra-Tasks-9.9.9-universal.dmg",
  "Ultra-Tasks-9.9.9-x64.dmg",
  "Ultra-Tasks-9.9.9-x64.zip",
  "Ultra-Tasks-9.9.9-x86_64.AppImage",
  "Ultra-Tasks-9.9.9-x86_64.rpm",
];
const commit = "0123456789abcdef0123456789abcdef01234567";
const sample = () => ({
  app: {
    tag: "ultra-tasks-v9.9.9",
    version: "9.9.9",
    publishedAt: "2030-01-05T10:00:00Z",
    url: "https://github.com/ultra-tasks/ultra-tasks/releases/tag/ultra-tasks-v9.9.9",
    highlights: ["Something good & new arrived in this release."],
    assets: appNames.map((name) => asset(name)),
  },
  server: {
    tag: "server-v1.0.0-beta.1",
    version: "1.0.0-beta.1",
    publishedAt: "2030-01-04T10:00:00Z",
    url: "https://github.com/ultra-tasks/ultra-tasks-server/releases/tag/server-v1.0.0-beta.1",
    image: `ghcr.io/ultra-tasks/ultra-tasks-server:sha-${commit}`,
    imageDigest: `sha256:${hash("b")}`,
    assets: [asset(`bundle-${commit}.tar.gz`, "c", 30_000), asset(`bundle-${commit}.tar.gz.sha256`, "d", 141)],
  },
});

test("the committed manifest is valid and every asset has a stable address", async () => {
  const manifest = await loadManifest();
  const rules = redirectRules(manifest);
  assert.equal(new Set(rules.map((rule) => rule.from)).size, rules.length);
  for (const rule of rules) {
    assert.match(rule.from, /^\/download\/[a-z0-9-]+$/);
    assert.match(rule.to, /^https:\/\/github\.com\/ultra-tasks\//);
  }
});

test("each platform has one main download and every file lands on its own address", () => {
  const manifest = sample();
  const files = appFiles(manifest);
  for (const platform of ["windows", "macos", "linux", "android"]) {
    assert.equal(files.filter((file) => file.platform === platform && file.primary).length, 1);
  }
  const byId = Object.fromEntries(files.map((file) => [file.id, file.asset.name]));
  assert.equal(byId.windows, "Ultra-Tasks-9.9.9-Setup.exe");
  assert.equal(byId["windows-portable"], "Ultra-Tasks-9.9.9-Portable.exe");
  assert.equal(byId.macos, "Ultra-Tasks-9.9.9-universal.dmg");
  assert.equal(byId["macos-intel"], "Ultra-Tasks-9.9.9-x64.dmg");
  assert.equal(byId["macos-apple-silicon-zip"], "Ultra-Tasks-9.9.9-arm64.zip");
  assert.equal(byId.android, "Ultra-Tasks-9.9.9-Android.apk");
  assert.equal(byId["android-fdroid"], "Ultra-Tasks-9.9.9-Android-FDroid.apk");
  assert.equal(byId["linux-appimage"], "Ultra-Tasks-9.9.9-x86_64.AppImage");
  assert.equal(serverFiles(manifest).length, 2);
});

test("a new kind of release asset stops the update until the website lists it", () => {
  const manifest = sample();
  manifest.app.assets.push(asset("Ultra-Tasks-9.9.9-arm64.AppImage"));
  assert.throws(() => validateManifest(manifest), /exactly one asset for "linux-appimage"|does not list/);
  const extra = sample();
  extra.app.assets.push(asset("Ultra-Tasks-9.9.9-mystery.bin"));
  assert.throws(() => validateManifest(extra), /does not list yet: Ultra-Tasks-9.9.9-mystery\.bin/);
});

test("a missing download, a bad checksum or an unpinned image is rejected", () => {
  const missing = sample();
  missing.app.assets = missing.app.assets.filter((item) => !item.name.endsWith("Setup.exe"));
  assert.throws(() => validateManifest(missing), /"windows"/);
  const badSum = sample();
  badSum.app.assets[1].sha256 = "nope";
  assert.throws(() => validateManifest(badSum), /SHA-256/);
  const unpinned = sample();
  unpinned.server.image = "ghcr.io/ultra-tasks/ultra-tasks-server:latest";
  assert.throws(() => validateManifest(unpinned), /server\.image/);
});

test("redirect rules point every address at the current release", () => {
  const manifest = sample();
  const text = redirectsText(manifest);
  assert.match(
    text,
    /^\/download\/windows\s+https:\/\/github\.com\/ultra-tasks\/ultra-tasks\/releases\/download\/ultra-tasks-v9\.9\.9\/Ultra-Tasks-9\.9\.9-Setup\.exe\s+302$/m,
  );
  assert.match(text, /^\/download\/release-notes\s+https:\/\/github\.com\/ultra-tasks\/ultra-tasks\/releases\/tag\/ultra-tasks-v9\.9\.9\s+302$/m);
  assert.match(text, /^\/download\/server-compose\s+.*\/server-v1\.0\.0-beta\.1\/bundle-/m);
  // Page links are not files, so nothing treats them as downloads.
  assert.equal(redirectRules(manifest).filter((rule) => rule.kind === "page").length, 2);
});

test("release notes become short plain highlights", () => {
  const body = [
    "# Ultra Tasks 9.9.9",
    "## What's new",
    "- **Bold** start, then a [link](https://example.com) and `code`. A second sentence.",
    "- Another thing without punctuation",
    "- " + "word ".repeat(60),
    "",
    "## Downloads",
    "- Not a highlight.",
  ].join("\n");
  const [first, second, third] = extractHighlights(body);
  assert.equal(first, "Bold start, then a link and code.");
  assert.equal(second, "Another thing without punctuation");
  assert.ok(third.length <= 171 && third.endsWith("…"));
  assert.deepEqual(extractHighlights("No sections here"), []);
});

test("sizes and dates read plainly", () => {
  assert.equal(formatSize(34_467), "34 KB");
  assert.equal(formatSize(263_360_413), "263 MB");
  assert.equal(formatDate("2026-11-08T18:57:48Z"), "8 November 2026");
  assert.equal(escapeHtml(`<a href="x">&</a>`), "&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;");
});

test("generated blocks are rewritten in place, escaped, indented and repeatable", () => {
  const manifest = sample();
  const page = [
    "<main>",
    ...REGIONS.flatMap((name) => [`  <div>`, `    <!-- release:${name} -->`, `    stale`, `    <!-- /release:${name} -->`, `  </div>`]),
    "</main>",
  ].join("\n");
  const once = applyRegions(page, manifest);
  assert.deepEqual(regionNames(once), REGIONS);
  assert.doesNotMatch(once, /stale/);
  assert.match(once, /^ {4}<li>Something good &amp; new arrived in this release\.<\/li>$/m);
  assert.match(once, /Version <strong>9\.9\.9<\/strong> · 5 January 2030/);
  assert.match(once, /href="\/download\/windows"/);
  assert.match(once, /docker pull ghcr\.io\/ultra-tasks\/ultra-tasks-server:sha-0123456789abcdef/);
  assert.equal(applyRegions(once, manifest), once, "a second run changes nothing");
  // Windows line endings survive.
  const crlf = applyRegions(page.replaceAll("\n", "\r\n"), manifest);
  assert.doesNotMatch(crlf, /[^\r]\n/);
});
