// Everything the website knows about the current release lives in
// data/release.json. This module turns that one file into
//
//   - the stable download addresses (/download/windows, /download/android, ...),
//     each of which redirects to the matching file on the GitHub release,
//   - the parts of download/index.html that change with every release
//     (file sizes, links, checksums, the Docker image, the release notes snippet),
//   - the checks that keep the page and the manifest in step.
//
// `npm run release:update` refreshes the manifest from GitHub. Nothing here
// runs in the visitor's browser, so the site makes no requests on their behalf.

import { readFile, writeFile } from "node:fs/promises";

export const APP_REPO = "ultra-tasks/ultra-tasks";
export const SERVER_REPO = "ultra-tasks/ultra-tasks-server";
export const IMAGE_NAME = "ghcr.io/ultra-tasks/ultra-tasks-server";
export const MANIFEST_FILE = "data/release.json";
export const DOWNLOAD_PAGE = "download/index.html";
export const HOME_PAGE = "index.html";

// Every app download the site offers. A release asset belongs to exactly one
// entry; the first entry of each platform with `primary` gets the big button.
// A new kind of asset on GitHub fails the update until it is listed here, so a
// file never ships to GitHub without a conscious decision about the website.
export const APP_FILES = [
  { id: "windows", platform: "windows", pattern: /-Setup\.exe$/, primary: true, button: "Download installer", label: "Installer", kind: ".exe" },
  { id: "windows-portable", platform: "windows", pattern: /-Portable\.exe$/, label: "Portable app", kind: ".exe" },
  { id: "macos", platform: "macos", pattern: /-universal\.dmg$/, primary: true, button: "Download for Mac", label: "Universal", kind: ".dmg" },
  { id: "macos-apple-silicon", platform: "macos", pattern: /-arm64\.dmg$/, label: "Apple Silicon", kind: ".dmg" },
  { id: "macos-intel", platform: "macos", pattern: /-x64\.dmg$/, label: "Intel", kind: ".dmg" },
  { id: "macos-apple-silicon-zip", platform: "macos", pattern: /-arm64\.zip$/, label: "Apple Silicon", kind: ".zip" },
  { id: "macos-intel-zip", platform: "macos", pattern: /-x64\.zip$/, label: "Intel", kind: ".zip" },
  { id: "linux-appimage", platform: "linux", pattern: /\.AppImage$/, primary: true, button: "Download AppImage", label: "AppImage", kind: ".AppImage" },
  { id: "linux-deb", platform: "linux", pattern: /\.deb$/, label: "Debian, Ubuntu", kind: ".deb" },
  { id: "linux-rpm", platform: "linux", pattern: /\.rpm$/, label: "Fedora, openSUSE", kind: ".rpm" },
  { id: "android", platform: "android", pattern: /-Android\.apk$/, primary: true, button: "Download APK", label: "Standard", kind: ".apk" },
  { id: "android-fdroid", platform: "android", pattern: /-Android-FDroid\.apk$/, label: "Without Google Play services", kind: ".apk" },
  { id: "checksums", platform: null, pattern: /^SHA256SUMS\.txt$/, label: "SHA256SUMS.txt", kind: ".txt" },
];
export const SERVER_FILES = [
  { id: "server-compose", pattern: /\.tar\.gz$/, label: "Compose bundle", kind: ".tar.gz" },
  { id: "server-compose-checksum", pattern: /\.tar\.gz\.sha256$/, label: "Checksum", kind: ".sha256" },
];
// Stable addresses that open a page on GitHub instead of downloading a file.
export const PAGE_LINKS = [
  { id: "release-notes", from: (m) => m.app.url },
  { id: "server-release-notes", from: (m) => m.server.url },
];
export const REGIONS = [
  "version",
  "highlights",
  "files-windows",
  "files-macos",
  "files-linux",
  "files-android",
  "server",
  "checksums",
];

export const assetUrl = (repo, tag, name) =>
  `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(name)}`;

export async function loadManifest(file = MANIFEST_FILE) {
  const manifest = JSON.parse(await readFile(file, "utf8"));
  validateManifest(manifest);
  return manifest;
}

function matchFiles(release, definitions, label) {
  const claimed = new Set();
  const files = definitions.map((definition) => {
    const matches = release.assets.filter((asset) => definition.pattern.test(asset.name));
    if (matches.length !== 1) {
      throw new Error(
        `${label}: expected exactly one asset for "${definition.id}", found ${matches.length}`,
      );
    }
    claimed.add(matches[0].name);
    return { ...definition, asset: matches[0] };
  });
  // Two definitions must never claim one file, and no file may go unclaimed.
  const names = files.map((file) => file.asset.name);
  if (new Set(names).size !== names.length) {
    throw new Error(`${label}: one asset matches more than one download`);
  }
  const unlisted = release.assets.map((asset) => asset.name).filter((name) => !claimed.has(name));
  if (unlisted.length) {
    throw new Error(
      `${label}: assets the website does not list yet: ${unlisted.join(", ")}. Add them to scripts/release.mjs.`,
    );
  }
  return files;
}

export function appFiles(manifest) {
  return matchFiles(manifest.app, APP_FILES, "App release").map((file) => ({
    ...file,
    path: `/download/${file.id}`,
    url: assetUrl(APP_REPO, manifest.app.tag, file.asset.name),
  }));
}

export function serverFiles(manifest) {
  return matchFiles(manifest.server, SERVER_FILES, "Server release").map((file) => ({
    ...file,
    path: `/download/${file.id}`,
    url: assetUrl(SERVER_REPO, manifest.server.tag, file.asset.name),
  }));
}

/** Every stable address under /download/ and where it leads. */
export function redirectRules(manifest) {
  return [
    ...appFiles(manifest),
    ...serverFiles(manifest),
  ]
    .map((file) => ({ from: file.path, to: file.url, kind: "file", id: file.id, asset: file.asset }))
    .concat(
      PAGE_LINKS.map((link) => ({
        from: `/download/${link.id}`,
        to: link.from(manifest),
        kind: "page",
        id: link.id,
      })),
    );
}

/** The Cloudflare Pages `_redirects` file. Temporary redirects: they change every release. */
export function redirectsText(manifest) {
  const rules = redirectRules(manifest);
  const width = Math.max(...rules.map((rule) => rule.from.length));
  return [
    "# Generated from data/release.json by scripts/build.mjs. Do not edit.",
    ...rules.map((rule) => `${rule.from.padEnd(width)}  ${rule.to}  302`),
    "",
  ].join("\n");
}

export function validateManifest(manifest) {
  const fail = (message) => {
    throw new Error(`${MANIFEST_FILE}: ${message}`);
  };
  const { app, server } = manifest ?? {};
  if (!app || !server) fail('needs "app" and "server"');
  if (!/^ultra-tasks-v\d+\.\d+\.\d+$/.test(app.tag ?? "")) fail(`unexpected app tag "${app.tag}"`);
  if (app.version !== app.tag.replace("ultra-tasks-v", "")) fail("app.version must match app.tag");
  if (app.url !== `https://github.com/${APP_REPO}/releases/tag/${app.tag}`) fail("app.url must be the release page");
  if (!/^server-v\d/.test(server.tag ?? "")) fail(`unexpected server tag "${server.tag}"`);
  if (server.url !== `https://github.com/${SERVER_REPO}/releases/tag/${server.tag}`) fail("server.url must be the release page");
  for (const release of [app, server]) {
    if (Number.isNaN(Date.parse(release.publishedAt))) fail(`${release.tag}: publishedAt is not a date`);
    if (!Array.isArray(release.assets) || release.assets.length === 0) fail(`${release.tag}: no assets`);
    for (const asset of release.assets) {
      if (!asset.name || !Number.isInteger(asset.size) || asset.size <= 0) fail(`${release.tag}: bad asset ${asset.name}`);
      if (!/^[0-9a-f]{64}$/.test(asset.sha256 ?? "")) fail(`${release.tag}: ${asset.name} needs a SHA-256`);
    }
  }
  if (!Array.isArray(app.highlights) || app.highlights.length < 1 || app.highlights.length > 6) {
    fail("app.highlights needs 1 to 6 short lines");
  }
  for (const line of app.highlights) {
    if (typeof line !== "string" || line.length < 10 || line.length > 200) fail(`bad highlight: ${line}`);
  }
  if (!new RegExp(`^${IMAGE_NAME.replaceAll(".", "\\.")}:sha-[0-9a-f]{40}$`).test(server.image ?? "")) {
    fail(`server.image must be ${IMAGE_NAME}:sha-<full commit>`);
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(server.imageDigest ?? "")) fail("server.imageDigest must be sha256:<64 hex>");
  appFiles(manifest);
  serverFiles(manifest);
}

// ---------------------------------------------------------------------------
// Formatting

export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

export function formatSize(bytes) {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1000))} KB`;
  return `${Math.round(bytes / 1_000_000)} MB`;
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "- **Bold** and [links](https://x)" bullets of a release's "What's new" list. */
export function extractHighlights(body, limit = 5) {
  const section = body
    .split(/^## /m)
    .find((part) => /^what.s new/i.test(part));
  if (!section) return [];
  return section
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) =>
      line
        .slice(2)
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/(\*\*|__)(.+?)\1/g, "$2")
        .replace(/`([^`]+)`/g, "$1")
        .trim(),
    )
    .map((line) => line.split(/(?<=[.!?])\s/)[0])
    .map((line) => (line.length > 170 ? `${line.slice(0, line.lastIndexOf(" ", 167))}…` : line))
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// The parts of the download page that change with every release.

const sizeOf = (file) => formatSize(file.asset.size);

function renderFiles(manifest, platform) {
  const files = appFiles(manifest).filter((file) => file.platform === platform);
  const primary = files.find((file) => file.primary);
  const others = files.filter((file) => file !== primary);
  const lines = [
    `<a class="button" href="${primary.path}"><span>${escapeHtml(primary.button)}</span><span class="dl-size">${sizeOf(primary)}</span></a>`,
  ];
  if (others.length) {
    lines.push('<ul class="dl-files">');
    for (const file of others) {
      lines.push(
        `  <li><a href="${file.path}">${escapeHtml(file.label)} <span class="dl-kind">${escapeHtml(file.kind)}</span></a><span class="dl-size">${sizeOf(file)}</span></li>`,
      );
    }
    lines.push("</ul>");
  }
  return lines.join("\n");
}

const RENDERERS = {
  version: (manifest) =>
    `Version <strong>${escapeHtml(manifest.app.version)}</strong> · ${escapeHtml(formatDate(manifest.app.publishedAt))}`,
  highlights: (manifest) =>
    manifest.app.highlights.map((line) => `<li>${escapeHtml(line)}</li>`).join("\n"),
  "files-windows": (manifest) => renderFiles(manifest, "windows"),
  "files-macos": (manifest) => renderFiles(manifest, "macos"),
  "files-linux": (manifest) => renderFiles(manifest, "linux"),
  "files-android": (manifest) => renderFiles(manifest, "android"),
  server: (manifest) => {
    const [bundle, checksum] = serverFiles(manifest);
    const { server } = manifest;
    return [
      '<p class="dl-label">Image · Linux AMD64 and ARM64</p>',
      `<div class="dl-code"><pre><code id="server-image-command">docker pull ${escapeHtml(server.image)}</code></pre><button class="dl-copy" type="button" data-copy="#server-image-command" hidden>Copy</button></div>`,
      `<p class="dl-meta">Digest <code>${escapeHtml(server.imageDigest)}</code></p>`,
      `<p class="dl-meta">Server ${escapeHtml(server.tag.replace("server-v", ""))} · ${escapeHtml(formatDate(server.publishedAt))}</p>`,
      '<div class="dl-actions">',
      `  <a class="button" href="${bundle.path}"><span>Download Compose bundle</span><span class="dl-size">${sizeOf(bundle)}</span></a>`,
      `  <a class="button button-quiet" href="${checksum.path}">Checksum</a>`,
      "</div>",
    ].join("\n");
  },
  checksums: (manifest) =>
    [
      "<tbody>",
      ...appFiles(manifest)
        .filter((file) => file.id !== "checksums")
        .map(
          (file) =>
            `  <tr><th scope="row">${escapeHtml(file.asset.name)}</th><td><code>${file.asset.sha256}</code></td></tr>`,
        ),
      "</tbody>",
    ].join("\n"),
};

export function renderRegion(name, manifest) {
  const render = RENDERERS[name];
  if (!render) throw new Error(`Unknown release region "${name}"`);
  return render(manifest);
}

const REGION = /^([ \t]*)<!-- release:([a-z-]+) -->\r?\n[\s\S]*?^[ \t]*<!-- \/release:\2 -->/gm;

/** Replace every `<!-- release:x -->` block with fresh content, keeping its indentation. */
export function applyRegions(html, manifest) {
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  return html.replace(REGION, (_whole, indent, name) => {
    const body = renderRegion(name, manifest)
      .split("\n")
      .map((line) => (line ? indent + line : line))
      .join(eol);
    return `${indent}<!-- release:${name} -->${eol}${body}${eol}${indent}<!-- /release:${name} -->`;
  });
}

export const regionNames = (html) => [...html.matchAll(REGION)].map((match) => match[2]);

/** The version in the home page's structured data follows the release too. */
export function applyHomeVersion(html, manifest) {
  return html.replace(
    /("softwareVersion":\s*")[^"]*(")/,
    `$1${manifest.app.version}$2`,
  );
}

/** Rewrite the release-dependent parts of the site. Returns the files that changed. */
export async function renderSite(manifest) {
  const changed = [];
  for (const [file, transform] of [
    [DOWNLOAD_PAGE, (html) => applyRegions(html, manifest)],
    [HOME_PAGE, (html) => applyHomeVersion(html, manifest)],
  ]) {
    const before = await readFile(file, "utf8");
    const after = transform(before);
    if (after !== before) {
      await writeFile(file, after);
      changed.push(file);
    }
  }
  return changed;
}
