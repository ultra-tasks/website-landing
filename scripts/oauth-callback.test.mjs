import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const html = await readFile(new URL("../oauth-callback/index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, "the hand-off page has its inline script");

// Runs the page script against a fake browser and reports what it did.
function visit(search, hash = "") {
  const calls = { replaced: [], history: [], listeners: [] };
  const elements = Object.fromEntries(
    ["callback-default", "callback-opening", "open-app"].map((id) => [
      id,
      { hidden: id !== "callback-default" ? true : false, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } },
    ]),
  );
  const location = {
    search,
    hash,
    pathname: "/oauth-callback/",
    href: `https://ultratasks.app/oauth-callback/${search}${hash}`,
    replace: (url) => calls.replaced.push(url),
  };
  const window = {
    location,
    history: { replaceState: (...args) => calls.history.push(args) },
  };
  const document = {
    getElementById: (id) => elements[id],
    addEventListener: (type, fn) => calls.listeners.push([type, fn]),
  };
  vm.runInNewContext(script, { window, document, URLSearchParams });
  // The page finishes its set-up once the document has loaded.
  for (const [type, fn] of calls.listeners) if (type === "DOMContentLoaded") fn();
  return { calls, elements, location };
}

test("a successful sign-in is passed to the app and the address bar is cleaned", () => {
  const { calls, elements, location } = visit("?code=abc123&state=xyz%20789");
  assert.deepEqual(calls.replaced, [
    "app.ultratasks:/plugin-oauth-callback?code=abc123&state=xyz+789",
  ]);
  assert.deepEqual(calls.history, [[null, "", "/oauth-callback/"]]);
  assert.equal(elements["callback-default"].hidden, true);
  assert.equal(elements["callback-opening"].hidden, false);
  assert.equal(elements["open-app"].hidden, false);
  // The button retries the same hand-off when the first attempt is blocked.
  elements["open-app"].listeners.click();
  assert.equal(location.href, "app.ultratasks:/plugin-oauth-callback?code=abc123&state=xyz+789");
});

test("a refusal from the provider reaches the app too", () => {
  const { calls } = visit("?error=access_denied&error_description=User%20said%20no&state=s1");
  assert.equal(calls.replaced.length, 1);
  assert.match(calls.replaced[0], /^app\.ultratasks:\/plugin-oauth-callback\?/);
  const forwarded = new URL(calls.replaced[0]).searchParams;
  assert.equal(forwarded.get("error"), "access_denied");
  assert.equal(forwarded.get("error_description"), "User said no");
  assert.equal(forwarded.get("state"), "s1");
});

test("only the sign-in values are forwarded, never other parameters or the fragment", () => {
  const { calls } = visit("?code=c&state=s&provider=evil&redirect=https://example.com&x=1", "#token=secret");
  assert.equal(calls.replaced.length, 1);
  const forwarded = new URL(calls.replaced[0]);
  assert.equal(`${forwarded.protocol}${forwarded.pathname}`, "app.ultratasks:/plugin-oauth-callback");
  assert.deepEqual([...forwarded.searchParams.keys()].sort(), ["code", "state"]);
  assert.doesNotMatch(calls.replaced[0], /secret|evil|example\.com/);
  // The fragment is removed from the address bar as well.
  assert.equal(calls.history.length, 1);
});

test("opening the page by hand does nothing but explain itself", () => {
  const { calls, elements } = visit("");
  assert.deepEqual(calls.replaced, []);
  assert.deepEqual(calls.history, []);
  assert.equal(elements["callback-default"].hidden, false);
  assert.equal(elements["open-app"].hidden, true);
});

test("a visit with unrelated parameters is cleaned but not forwarded", () => {
  const { calls } = visit("?utm_source=mail");
  assert.deepEqual(calls.replaced, []);
  assert.deepEqual(calls.history, [[null, "", "/oauth-callback/"]]);
});
