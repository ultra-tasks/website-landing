# Ultra Tasks website

The public Ultra Tasks landing page: a small, responsive static website in plain
HTML, CSS, and JavaScript. Teal is the single accent colour on white and soft
grey surfaces, set in the rounded typeface Rubik. The font files are served from
this site, and the source has no dependencies, remote scripts, cookies or
background API requests. One thing comes from the hosting, not the source:
Cloudflare Pages adds its Web Analytics script to the pages (see
[Analytics](#analytics)), and the site says so in its footer.

## Run locally

Use Node.js 22 or newer. No package installation is needed.

```sh
npm run dev
```

Open <http://127.0.0.1:4321>. Change the port using the `PORT` environment
variable if needed. The preview binds only to loopback. Reload after edits.

```sh
npm run check
npm test
npm run build
npm run preview
```

`check` validates JavaScript syntax and, for every page (home, download, 404 and
each guide), internal links and anchors, unique IDs, local assets, image
attributes, unique titles, title and description length, canonical URLs,
structured data, the identical analytics footer note, and the absence of remote
scripts. It also checks that `sitemap.xml` lists every indexable page and
nothing else, that the download page matches `data/release.json`, that every
`/download/...` link has a target, and that each navigation bar has the Sign in
link and the Download button. `npm test` runs the unit tests for the release
tooling and the sign-in links. `build` copies the public files into `dist/`,
writes the `_redirects` file for the download addresses, and sets the sign-in
links. Deploy the contents of `dist/` to any static host that understands
Cloudflare-style `_redirects` (or recreate those redirects). No server runtime,
credentials, or build service is required in production. Canonical and social
URLs use the `https://ultratasks.app` domain; update the metadata in the pages
if the final domain differs.

## Content and interaction

- A short headline, a download button, and the real Today view with a
  Light / Dark switch.
- Four numbered steps (Capture, Plan, Focus, Organize), each with a real
  screenshot or snippet, then a plain grid of smaller details.
- Privacy, local storage, sync, and the GNU AGPL license, with a "Beta" card for
  UltraSync (end-to-end encrypted, open source and self-hostable, with a Sign in
  link). The card is HTML, not a screenshot.
- A sourced comparison with Todoist and TickTick.
- Explicit platform status, so unpublished clients (iOS, hosted web) say
  "Coming soon" instead of looking like downloads.
- A dedicated `/download/` page (see [Downloads and releases](#downloads-and-releases)).
- A FAQ in native disclosures, download links, GitHub links, and upstream
  attribution.
- A `/guides/` section for search: one folder per guide, starting with a
  step-by-step guide to moving from Todoist (see [Guides](#guides)).
- A keyboard-accessible mobile menu. Content, links and the FAQ remain usable
  without JavaScript.
- Search basics: title and description, canonical URL, Open Graph and Twitter
  tags, JSON-LD for the software, `sitemap.xml`, and `robots.txt`.

Public app links point to <https://github.com/ultra-tasks/ultra-tasks>.

## Screenshots and branding

`assets/logo.svg` is the app's own Ultra Tasks logo, copied from
`super-tasks/src/assets/ultra-tasks/logo.svg`.

Every other image in `assets/` is a real capture of the locally built Ultra
Tasks 0.1.0 web interface, shot with fictional everyday-life tasks (Home, Work,
Study and Me time projects). They contain no personal data. They show a
development build, so the released desktop interface may differ. Keep each
image's `width` and `height` and its alt text in `index.html` in sync when
replacing it.

| File | Shows | Made from |
| --- | --- | --- |
| `shot-today-light.webp`, `shot-today-dark.webp` | Today, light and dark (hero switch) | Full window, 1440×900 at 2x |
| `step-capture.webp` | Today list (step 1) | Crop of the Today master |
| `snippet-add-task.webp` | Add task bar with short syntax | Tight crop, rounded corners masked |
| `step-plan.webp` | Upcoming, three and a half days (step 2) | Crop of the Upcoming master, left rail removed |
| `step-focus.webp` | Focus mode (step 3) | Centred crop of the Focus master |
| `step-board.webp` | Home project as a board (step 4) | Crop of the Board master |
| `snippet-task-detail.webp` | Task detail panel with subtasks | Top part of the panel only |
| `og-image.png` | 1200×630 social preview | Rendered from the hero shot and the headline, set in Rubik |
| `fonts/rubik-400.woff`, `fonts/rubik-700.woff` | The site typeface | Latin subset of the installed Rubik 1.100 (made with `fontTools`, no Brotli, so WOFF rather than WOFF2) |

The captures come from the app repository's Playwright screenshot pipeline
(`e2e/store-screenshots/`) with a seed written for this site. That spec and the
PNG masters live in the app repository's ignored `.tmp/landing-shots/` folder, so
they are not part of this repository. `sharp` is not an app dependency: install it
in a scratch folder to convert the PNG masters to WebP (quality 82). Each capture
pins the clock to Tuesday 10 November 2026, 09:30, so dates in the images stay
consistent.

## Keeping claims current

Copy is grounded in the app repository's README, `LICENSE` and `LICENSING.md`,
and sync-provider reference, reviewed November 2026. The canonical GitHub
organization was verified separately (`ac9492/ultra-tasks` only redirects to
`ultra-tasks/ultra-tasks`).

**License.** The current distribution is GNU AGPL-3.0-only (`package.json`,
`LICENSE`). Inherited Super Productivity code keeps its MIT rights and notices,
and earlier MIT-licensed releases stay MIT-licensed. The page says this in its
license FAQ and links to `LICENSING.md`, so keep that wording in step with the
file when it changes. The page does not call the whole project "MIT" anywhere.

**UltraSync.** Release 0.3.0 (8 November 2026) shipped UltraSync, the private,
end-to-end encrypted account sync with an account dashboard at
`app.ultratasks.app/account` and a self-hostable server (the
`ultra-tasks-server` repository). The copy follows the release notes: it is a
beta, new sign-ups on the official service are closed, collaboration and the
hosted web app come later, and an independent cryptographic review is pending.
The always-free plan and the possibility of paid plans later come from the
maintainer (confirmed November 2026) and are stated in the future tense, because
there is no plan to sign up for yet. The page never says "completely free" about
the service. **When sign-ups open or the review is done, update the sync card,
the FAQ, the comparison footnote, the self-hosting section of the download page,
and this paragraph together.** The page does not advertise SuperSync.

**Platforms and version.** The current release lives in `data/release.json`
(see [Downloads and releases](#downloads-and-releases)): Windows (Setup and
Portable, x64 and ARM64), macOS (Apple Silicon, Intel and Universal), Linux x64
(AppImage, DEB, RPM) and Android (signed APKs, with and without Google Play
services), plus `SHA256SUMS.txt`. Windows builds are unsigned, macOS builds are
not notarized, and nothing is in an app store. iOS and a hosted web app are
"Coming soon". When a release changes this, update together: the platform
section of the home page, the FAQ, the meta description, `operatingSystem` in
the structured data, the download page cards, the download button labels in
`script.js`, and any guide that names a version. `softwareVersion` follows the
manifest automatically.

Sync options other than UltraSync (WebDAV and OneDrive) are described only as
"also available"; saved Dropbox, Nextcloud and local-file connections still work
in the app as deprecated connections, but the page does not promote them.

Competitor comparisons describe their published security information, rather
than an independent audit. Review the primary sources when updating the table:

- [Todoist security](https://www.todoist.com/security)
- [TickTick security](https://ticktick.com/security)
- [Ultra Tasks sync reference](https://github.com/ultra-tasks/ultra-tasks/blob/main/docs/wiki/3.08-Sync-Integration-Comparison.md)

Ultra Tasks is an independent fork of
[Super Productivity](https://github.com/super-productivity/super-productivity),
created by Johannes Millan and its contributors. It is not an official upstream
release.

## Design notes

The page was redesigned in November 2026 to be quieter and to let the real app
do the talking. It borrows two ideas from sites we admire: a large product
window directly under a short headline (Ellie), and plain oversized type with
lots of white space (Ente). Decisions worth keeping:

- One accent colour (teal) and one rounded typeface for everything. Rubik is
  self-hosted (`assets/fonts/`, SIL Open Font License, text in `OFL.txt`) as two
  Latin-only WOFF files of about 19 KB each: Regular for the big headlines and
  body, Bold for buttons and small headings. Rubik Bold has a very narrow space, so
  bold elements get a little extra `word-spacing` in `styles.css`. No stickers,
  sparkles or decorative illustrations.
- The download buttons name the visitor's system ("Download for Windows",
  "macOS", "Linux" or "Android") and open the download page, where that
  system's card is marked "For your device". iPhones, iPads and unrecognised
  systems keep the generic "Download for desktop" label (iOS with an honest
  note), and so does anyone without JavaScript.
- Every visual is a real screenshot or a crop of one. The first step uses a
  small snippet floating over the list it belongs to; the last uses the task
  detail panel over a board.
- The hero's Light / Dark switch is the only script beyond the mobile menu. With
  JavaScript off, the switch is hidden and the light screenshot stays.
- The Calendar view is not shown yet. Its time blocks currently overlap their
  icons and times, so it is mentioned in the copy only. Re-shoot it once the
  app is fixed.

Search optimisation notes and a plan for future articles are in
[`docs/seo-article-plan.md`](docs/seo-article-plan.md).

## Downloads and releases

`/download/` lists every platform, the Docker image for self-hosting UltraSync,
a snippet of the latest release notes and the SHA-256 checksums. File links go
through stable addresses on this site, such as `/download/windows`,
`/download/macos`, `/download/linux-appimage` and `/download/android`. Each one
is a temporary redirect (Cloudflare Pages `_redirects`, generated at build time)
to the matching file on the current GitHub release, which GitHub serves as an
attachment, so the browser starts the download without opening a GitHub page.
Two addresses deliberately do open GitHub pages: `/download/release-notes` and
`/download/server-release-notes`. The pages never link to a GitHub release file
directly, and `npm run check` enforces that.

Everything that changes per release lives in **`data/release.json`**: tag,
date, file sizes and SHA-256 digests, the "What's new" lines, and the server's
pinned Docker image and digest. The blocks of `download/index.html` between
`<!-- release:name -->` markers, and `softwareVersion` on the home page, are
generated from it. Nothing is fetched in a visitor's browser.

To publish a new release on the website:

```sh
npm run release:update    # reads the latest GitHub releases, rewrites the manifest and pages
git diff                  # read the "What's new" lines; edit highlights in data/release.json
npm run release:render    # after editing the manifest by hand
npm run release:verify    # HEAD-checks every download and the Docker image (needs network)
npm run check && npm test && npm run build
```

`release:update` takes the latest app release (`/releases/latest`) and the newest
`server-v*` release of `ultra-tasks-server`, whose notes must contain the pinned
`ghcr.io/ultra-tasks/ultra-tasks-server:sha-<commit>` tag and `Registry digest`
line. Pass `--tag ultra-tasks-v0.3.0` or `--server-tag server-v0.1.0-beta.1` to
choose a release, and set `GITHUB_TOKEN` if GitHub rate-limits you. It keeps
hand-edited highlights while the release tag is unchanged. A new kind of release
asset makes it stop until you list it in `scripts/release.mjs`, so no file
appears on GitHub without a decision about the website.

The static copy around the generated blocks (platform descriptions, install
notes, the self-hosting text, "sign-ups are closed") is hand-written. Re-read it
for each release: the Android build descriptions come from `android/app/build.gradle`
(`play` uses Google Play services, `fdroid` does not), and the unsigned or
not-notarized warnings come from the release notes.

### Sign in link

The header on every page has a **Sign in** link to UltraSync's account dashboard
(`https://app.ultratasks.app/account?view=login`), and the home page's UltraSync
card and the self-hosting section repeat it. The markup is
`<a data-account-link="login" hidden>`; the build removes `hidden` and sets the
address. Leave `PUBLIC_ACCOUNT_URL` unset to use the official dashboard, set it
to an empty value to remove the links, or set it to another HTTPS origin for a
self-hosted account server (see `.env.example` and
`docs/account-integration.md`). There is deliberately no "Sign up" link while
sign-ups on the official service are closed.

## Guides

Guides are plain static pages at `guides/<slug>/index.html`, served at
`/guides/<slug>/`. The index is `guides/index.html`. To add one:

1. Copy an existing guide folder. Keep the header, the footer and the
   "About this website" note exactly as they are; `npm run check` fails if the
   note differs from the home page.
2. Use root-absolute links and assets (`/styles.css`, `/assets/...`, `/#faq`,
   `/guides/other/` with a trailing slash). Relative links break in a folder.
3. Give it its own title (70 characters at most), description (70 to 160), the
   canonical and `og:url` for its own address, `Article` and `BreadcrumbList`
   structured data, and a visible author and "Updated" date.
4. Add it to `sitemap.xml` and to the list on `guides/index.html`.
5. Run `npm run check && npm run build`.

Cloudflare Pages answers `/guides` with a redirect to `/guides/`, and the local
preview does the same.

**Sourcing.** State which Ultra Tasks version a guide was checked against, link
the app's own wiki page and the competitor's own help page, and say what does
not carry over. The Todoist guide follows `docs/wiki/2.20-Import-from-Todoist.md`
in the app repository and the importer's code and tests, checked November 2026.
It was not run against a real Todoist export, and Todoist does not publish what
its CSV `DATE` column looks like. The importer only schedules exact
`YYYY-MM-DD` dates and keeps anything else in the task notes, so the guide
describes that behaviour and tells readers to check their own file. Run one real
export through the app before you promote the guide, and tighten the date
section if the result differs.

## Cloudflare Pages deployment

Cloudflare Pages project `ultra-tasks` is connected to
[`ultra-tasks/website-landing`](https://github.com/ultra-tasks/website-landing):

- Production domain: <https://ultratasks.app>
- Pages hostname: <https://ultra-tasks-2no.pages.dev>

- Production branch: `main`
- Framework preset: None
- Build command: `npm run check && npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Node.js: 22, selected through `.node-version`

Cloudflare's Git integration deploys new commits pushed to `main` and creates
preview deployments for other branches. The build includes validation before
publishing. No deployment token or GitHub Actions secret is needed.

To publish an update, commit and push it to `main`. Cloudflare validates the
source, builds `dist/`, and publishes the successful build automatically. View
build logs and deployment history in Workers & Pages → `ultra-tasks`.

`ultratasks.app` is attached in the project's Custom domains settings. The apex
CNAME points to `ultra-tasks-2no.pages.dev`; Cloudflare manages DNS and HTTPS.
Do not deploy the repository root: only `dist/` contains the public site files.

### Caching and the 404 page

Cloudflare Pages serves `styles.css` and `script.js` with `max-age=14400` (four
hours) but always revalidates HTML. After the first redesign deploy, anyone who
had loaded the old site in the previous four hours got the new page with the old
cached stylesheet, and it looked broken. To prevent that, `npm run build` stamps
a content hash into the references in `dist/index.html` and `dist/404.html`
(`styles.css?v=<hash>`), so every change to those files gets a new address. The
source files keep plain names. Do not add other long-cached files under a name
that you later replace with different content. Rename them, or extend the hash
step in `scripts/build.mjs`.

The site includes `404.html`. Without one, Cloudflare Pages treats a site as a
single-page app and answers every unknown address with the home page and a 200
status. With it, unknown addresses get a real 404, which search engines expect.
The 404 page is marked `noindex` and uses only root-absolute links, because it is
served at whatever address was mistyped. `npm run check` enforces both, and the
local preview serves it the same way.

### Analytics

Cloudflare injects its Web Analytics beacon (`static.cloudflareinsights.com`) into
the live HTML, including the 404 page. It is not in this repository or in `dist/`,
so `npm run check` cannot see it, and a plain `curl` does not show it. Only a
browser-like request does (send a browser `User-Agent` and `Accept: text/html`).
Found in November 2026; I could not tell when it was switched on. In a test
browser it set no cookies and made one request to Cloudflare per page view.

The maintainer decided to keep it, so the site says so:

- The footer note on both pages ("About this website", anchor `#site-analytics`)
  explains that the site counts visits with Cloudflare Web Analytics, links to
  <https://www.cloudflare.com/web-analytics/>, and says the app has no analytics.
- Every "no tracking" claim is scoped to the app ("No tracking in the app",
  "The app has no ads, no analytics and no tracking"), never to the website.
- The footer states only what Cloudflare publishes on that page: no cookies or
  localStorage, and no fingerprinting for analytics. Cloudflare's page does not
  say how IP addresses are handled, so the site makes no claim about that.
  Cloudflare's FAQ adds that unsampled data is kept for 7 days and that query
  strings are not logged.

To remove it, turn off Web Analytics for the Pages project and for the
`ultratasks.app` zone in the Cloudflare dashboard (it can be enabled in either
place), then delete the footer notes and restore the unscoped wording. To check
what is live, fetch the page with a browser `User-Agent` and look for
`cloudflareinsights`.
