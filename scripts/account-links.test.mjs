import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { accountOrigin, configureAccountLinks } from "./account-links.mjs";

test("account links accept a configured HTTPS origin and reject credentials or unsafe redirects", () => {
  assert.equal(accountOrigin("https://accounts.example.com"), "https://accounts.example.com");
  assert.equal(accountOrigin("http://localhost:1900"), "http://localhost:1900");
  for (const value of ["http://remote.example", "https://user:password@example.com", "https://example.com/path", "https://example.com?redirect=elsewhere", "javascript:alert(1)"]) assert.throws(() => accountOrigin(value));
});
test("sign-in stays hidden until a server is configured and uses that server's account page", async () => {
  const directory = await mkdtemp(join(tmpdir(), "ultra-account-links-"));
  try {
    const file = join(directory, "index.html");
    await writeFile(file, '<a href="https://ultratasks.app/account" data-account-link="login" hidden>Sign in</a>');
    await configureAccountLinks(directory, "");
    assert.doesNotMatch(await readFile(file, "utf8"), /Sign in/);
    await writeFile(file, '<a href="https://ultratasks.app/account" data-account-link="login" hidden>Sign in</a>');
    await configureAccountLinks(directory, "https://accounts.example.com");
    const html = await readFile(file, "utf8");
    assert.match(html, /href="https:\/\/accounts.example.com\/account\?view=login"/);
    assert.doesNotMatch(html, /hidden/);
  } finally {
    assert.equal(dirname(directory), resolve(tmpdir()));
    await rm(directory, { recursive: true, force: true });
  }
});
