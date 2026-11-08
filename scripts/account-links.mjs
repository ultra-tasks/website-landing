import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

// The official UltraSync account dashboard (published with Ultra Tasks 0.3.0).
export const OFFICIAL_ACCOUNT_URL = "https://app.ultratasks.app";

// PUBLIC_ACCOUNT_URL unset: link to the official dashboard. Set to an empty
// string: hide the sign-in links. Set to an origin: link to that server.
export function resolveAccountUrl(value) {
  return value === undefined ? OFFICIAL_ACCOUNT_URL : value;
}

export function accountOrigin(value) {
  if (!value) return null;
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && local))) {
    throw new Error("PUBLIC_ACCOUNT_URL must be an HTTPS account-server origin (localhost HTTP is allowed for development)");
  }
  return url.origin;
}

export async function configureAccountLinks(directory, value) {
  const origin = accountOrigin(value);
  for (const entry of await readdir(directory, { recursive: true })) {
    if (!entry.endsWith(".html")) continue;
    const file = join(directory, entry);
    const html = await readFile(file, "utf8");
    const updated = html.replace(/<a\b([^>]*\bdata-account-link="(login|signup)"[^>]*)>([\s\S]*?)<\/a>/g,
      (_whole, attributes, view, label) => {
        if (!origin) return "";
        const safe = attributes.replace(/\shidden(?:="[^"]*")?/, "").replace(/\shref="[^"]*"/, ` href="${origin}/account?view=${view}"`);
        return `<a${safe}>${label}</a>`;
      });
    if (updated !== html) await writeFile(file, updated);
  }
}
