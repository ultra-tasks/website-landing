// Check that every download the website offers really works on GitHub.
//
//   npm run release:verify
//
// For each /download/ address it follows the redirect, then confirms that the
// file exists, downloads as an attachment, and has the size recorded in
// data/release.json. It also confirms the Docker image can be found in the
// registry without signing in. Run it before deploying a release update.
// It sends HEAD requests only, so nothing large is downloaded.

import assert from "node:assert/strict";
import { IMAGE_NAME, loadManifest, redirectRules } from "./release.mjs";

const manifest = await loadManifest();
let failures = 0;
const report = (ok, label, detail = "") => {
  if (!ok) failures += 1;
  console.log(`${ok ? "ok  " : "FAIL"} ${label}${detail ? `  ${detail}` : ""}`);
};

for (const rule of redirectRules(manifest)) {
  try {
    const response = await fetch(rule.to, { method: "HEAD", redirect: "follow" });
    assert.equal(response.status, 200, `HTTP ${response.status}`);
    if (rule.kind === "file") {
      const disposition = response.headers.get("content-disposition") ?? "";
      assert.match(disposition, /attachment/i, "does not download as an attachment");
      const size = Number(response.headers.get("content-length"));
      assert.equal(size, rule.asset.size, `size ${size} differs from the manifest (${rule.asset.size})`);
    }
    report(true, rule.from);
  } catch (error) {
    report(false, rule.from, error.message);
  }
}

// The image must be public: ask the registry for an anonymous pull token.
try {
  const [repository, tag] = manifest.server.image.replace("ghcr.io/", "").split(":");
  assert.equal(`ghcr.io/${repository}`, IMAGE_NAME);
  const token = (
    await (await fetch(`https://ghcr.io/token?scope=repository:${repository}:pull`)).json()
  ).token;
  const response = await fetch(`https://ghcr.io/v2/${repository}/manifests/${tag}`, {
    method: "HEAD",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: [
        "application/vnd.oci.image.index.v1+json",
        "application/vnd.docker.distribution.manifest.list.v2+json",
        "application/vnd.oci.image.manifest.v1+json",
        "application/vnd.docker.distribution.manifest.v2+json",
      ].join(", "),
    },
  });
  assert.equal(response.status, 200, `registry answered HTTP ${response.status}`);
  const digest = response.headers.get("docker-content-digest");
  assert.equal(digest, manifest.server.imageDigest, `registry digest is ${digest}`);
  report(true, manifest.server.image, "public, digest matches");
} catch (error) {
  report(false, manifest.server.image, error.message);
}

if (failures) {
  console.error(`\n${failures} problem(s). Fix data/release.json or the release, then run this again.`);
  process.exit(1);
}
console.log("\nEvery download and the Docker image check out.");
