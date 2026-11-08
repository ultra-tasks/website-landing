# AGENTS.md

Guidance for AI agents working in this repository: the ultratasks.app website, a static site in plain HTML, CSS and JavaScript (Node 22+, no dependencies) hosted on Cloudflare Pages. **Pushing `main` deploys the live site**, so never push without the maintainer's approval, and commit only when asked. The [README](README.md) has the full detail; this file is the checklist.

## Commands

```bash
npm run check             # validates every page, links, sitemap, the download page against data/release.json
npm test                  # unit tests for the release tooling and sign-in links
npm run build             # writes dist/ (hashed CSS/JS, _redirects, sign-in links)
npm run dev               # local preview of the source on http://127.0.0.1:4321
npm run release:update    # refresh data/release.json from GitHub and rewrite the generated page blocks
npm run release:render    # rewrite the generated blocks after editing data/release.json by hand
npm run release:verify    # HEAD-check every download and the Docker image (needs network)
```

Run `npm run check && npm test && npm run build` before reporting work as done.

## Releases: keep the website current

**Every new GitHub release must reach the website in the same task.** That means a release of `ultra-tasks/ultra-tasks` (tag `ultra-tasks-v*`) and a release of `ultra-tasks/ultra-tasks-server` (tag `server-v*`, which carries the Docker image and Compose bundle). Agents that publish or finish a release in either repository do this next, in a sibling checkout of this repository (`../website-landing`) or a fresh clone of `ultra-tasks/website-landing`.

1. **Wait for the published release with all its assets.** `npm run release:update` reads the latest published releases, so it must not run on a draft or a half-uploaded release.
2. **`npm run release:update`.** It rewrites `data/release.json`, the generated blocks in `download/index.html` (between `<!-- release:… -->` markers) and `softwareVersion` on the home page. Use `-- --tag <tag>` or `-- --server-tag <tag>` to pick a release. If it stops on "assets the website does not list yet", add the new file type to `APP_FILES` or `SERVER_FILES` in `scripts/release.mjs` (with a test in `scripts/release.test.mjs`) instead of working around it. If it cannot find the image tag or `Registry digest` in the server notes, the notes must be fixed first; the page must pin an exact tag and digest.
3. **Review the "What's new" lines.** The update extracts them from the release notes. Edit `app.highlights` in `data/release.json` (1 to 6 plain lines, no markdown, in the notes' own claims), then run `npm run release:render`. A highlight is never stronger than the release notes.
4. **Re-read the hand-written copy against the release notes.** Only facts the notes (or the code) state may appear. Check, in `download/index.html` and `index.html`: the platform cards and notes, "Coming soon" for anything unpublished (iOS and hosted web as of 0.3.0), the Android minimum version (`minSdkVersion` in the app's `android/app/build.gradle`) and build descriptions, unsigned or not-notarized warnings, the self-hosting section, the platform list, FAQ answers, the meta description and `operatingSystem`, and the sync statements (beta, sign-ups closed, collaboration, review status). Update the README's "UltraSync" and "Platforms and version" paragraphs when those facts change.
5. **Set `<lastmod>` in `sitemap.xml`** for `/download/` and `/` to the release date.
6. **Verify:** `npm run release:verify`, then `npm run check && npm test && npm run build`.
7. **Report what changed and stop.** Leave the work uncommitted (or committed locally if asked) and ask the maintainer before pushing `main`.

If a release changes the platforms or sync story, a new feature may also deserve a line on the home page's details grid or a guide. Raise it; do not invent marketing claims.

## Rules

- **Downloads go through `/download/<id>`.** Never link a GitHub release file directly, never hand-edit between `<!-- release:… -->` markers, and never edit `dist/` or `_redirects` (generated). Release notes pages are reached through `/download/release-notes` and `/download/server-release-notes`.
- **No tracking, no remote scripts, no background requests.** `script.js` must not call `fetch`, XHR or `sendBeacon`; the only third-party script is the Cloudflare Web Analytics one the host injects, disclosed in the identical footer note on every page. Never ask visitors' browsers to contact GitHub or any API.
- **Honest copy.** Early development, beta, unsigned builds and unfinished features are stated plainly. The always-free plan and possible paid plans for UltraSync are the maintainer's statement and stay in the future tense. Never write "completely free" about the sync service.
- **Page conventions.** Pages other than the home page use root-absolute links and assets, link folders with a trailing slash, keep the header and footer in step with the home page, give each page a unique title, description and canonical URL, and appear in `sitemap.xml`. `npm run check` enforces these. See "Guides" in the README to add a guide.
- **Sign in.** The Sign in link is `<a data-account-link="login" hidden>`; the build sets its address from `PUBLIC_ACCOUNT_URL` (default: the official dashboard). Do not add a Sign up link until registration opens on the official service.
- **Agent-control files.** Change `AGENTS.md` or `CLAUDE.md` only when the maintainer asks.
