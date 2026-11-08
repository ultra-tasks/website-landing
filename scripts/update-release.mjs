// Refresh data/release.json from GitHub, then rewrite the pages that depend on it.
//
//   npm run release:update                       latest app release + latest server release
//   npm run release:update -- --tag ultra-tasks-v0.3.0 --server-tag server-v0.1.0-beta.1
//   npm run release:render                       rewrite the pages from the manifest, offline
//
// It reads public GitHub release data only. Set GITHUB_TOKEN to avoid the
// anonymous rate limit. Review `git diff` afterwards; the "What's new" lines on
// the download page are taken from the release notes and are worth a read.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import {
  APP_REPO,
  IMAGE_NAME,
  MANIFEST_FILE,
  SERVER_REPO,
  extractHighlights,
  loadManifest,
  renderSite,
  validateManifest,
} from "./release.mjs";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? undefined : args[index + 1];
};

async function render(manifest) {
  const changed = await renderSite(manifest);
  console.log(changed.length ? `Updated ${changed.join(", ")}` : "Pages already match the manifest.");
}

if (args.includes("--render-only")) {
  await render(await loadManifest());
  process.exit(0);
}

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "ultra-tasks-website-release-sync",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};
async function api(path) {
  const response = await fetch(`https://api.github.com/${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub ${path}: ${response.status} ${response.statusText}`);
  return response.json();
}

function summarise(release) {
  return {
    tag: release.tag_name,
    publishedAt: release.published_at,
    url: release.html_url,
    assets: release.assets
      .map((asset) => ({
        name: asset.name,
        size: asset.size,
        sha256: (asset.digest ?? "").replace(/^sha256:/, ""),
      }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

const previous = await loadManifest().catch(() => null);

const appRelease = option("tag")
  ? await api(`repos/${APP_REPO}/releases/tags/${option("tag")}`)
  : await api(`repos/${APP_REPO}/releases/latest`);
const serverRelease = option("server-tag")
  ? await api(`repos/${SERVER_REPO}/releases/tags/${option("server-tag")}`)
  : (await api(`repos/${SERVER_REPO}/releases?per_page=30`)).find(
      (release) => release.tag_name.startsWith("server-v") && !release.draft,
    );
if (!serverRelease) throw new Error("No server release found");

const app = {
  ...summarise(appRelease),
  version: appRelease.tag_name.replace("ultra-tasks-v", ""),
  name: appRelease.name,
  prerelease: appRelease.prerelease,
};
// Keep hand-edited highlights for a release that has not changed.
app.highlights =
  previous?.app.tag === app.tag
    ? previous.app.highlights
    : extractHighlights(appRelease.body ?? "");

const image = serverRelease.body?.match(
  new RegExp(`${IMAGE_NAME.replaceAll(".", "\\.")}:sha-[0-9a-f]{40}`),
)?.[0];
const imageDigest = serverRelease.body?.match(/Registry digest:\s*`?(sha256:[0-9a-f]{64})/)?.[1];
if (!image || !imageDigest) {
  throw new Error(
    `${serverRelease.tag_name}: could not find the image tag and registry digest in the release notes`,
  );
}
const server = {
  ...summarise(serverRelease),
  version: serverRelease.tag_name.replace("server-v", ""),
  prerelease: serverRelease.prerelease,
  image,
  imageDigest,
};

const manifest = { app, server };
validateManifest(manifest);
await mkdir("data", { recursive: true });
const text = `${JSON.stringify(manifest, null, 2)}\n`;
const before = await readFile(MANIFEST_FILE, "utf8").catch(() => "");
if (text !== before) await writeFile(MANIFEST_FILE, text);
console.log(
  `${text === before ? "Manifest unchanged" : "Wrote " + MANIFEST_FILE}: app ${app.version}, server ${server.version}`,
);
await render(manifest);
