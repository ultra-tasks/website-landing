# Ultra Tasks website

The public Ultra Tasks landing page: a small, responsive static website in plain
HTML, CSS, and JavaScript. Teal is the single accent colour on white and soft
grey surfaces, set in the rounded typeface Rubik. The font files are served from
this site, so there are no dependencies, requests to font services, analytics,
tracking scripts, cookies, or background API requests.

## Run locally

Use Node.js 22 or newer. No package installation is needed.

```sh
npm run dev
```

Open <http://127.0.0.1:4321>. Change the port using the `PORT` environment
variable if needed. The preview binds only to loopback. Reload after edits.

```sh
npm run check
npm run build
npm run preview
```

`check` validates JavaScript syntax, internal links, unique IDs, local assets,
image attributes, the title and description length, the structured data, the
sitemap, and the absence of remote scripts. `build` copies the public
files into `dist/`. Deploy the contents of `dist/` to any static host. No server
runtime, credentials, or build service is required in production. Canonical and
social URLs currently use the planned `https://ultratasks.app` domain; update
the metadata in `index.html` if the final domain differs.

## Content and interaction

- A short headline, a download button, and the real Today view with a
  Light / Dark switch.
- Four numbered steps (Capture, Plan, Focus, Organize), each with a real
  screenshot or snippet, then a plain grid of smaller details.
- Privacy, local storage, end-to-end encrypted sync, open source, and
  self-hosting, with a snippet of the real sync settings.
- A sourced comparison with Todoist and TickTick.
- Explicit platform status, so planned clients are not presented as downloads.
- A FAQ in native disclosures, download links, GitHub links, and upstream
  attribution.
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
| `snippet-sync-privacy.webp` | Sync settings with the encryption note | Top part of the dialog, no token field content |
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

Copy is grounded in the app repository's README, MIT license, sync-provider
reference, and SuperSync server documentation, reviewed November 2026. The
canonical GitHub organization was verified separately.

The current app README lists Windows and macOS releases. Linux and mobile
releases are not published, and there is no hosted Ultra Tasks web app linked
here; the web client can be built from source. Update the platform section and
download copy together when releases change.

SuperSync requires end-to-end encryption of task content; routing/causal
metadata such as IDs and timestamps remains visible. Encryption is optional
with file-based providers. SuperSync is in beta, and cross-client validation
is still ongoing. Keep these distinctions when editing privacy copy.

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
- The download buttons name the visitor's system ("Download for Windows" or
  "Download for macOS"). Phones, tablets and Linux keep the generic label plus an
  honest note, and so does anyone without JavaScript. Both buttons link to the
  latest release page rather than a file, because asset names carry the version
  (for example `Ultra-Tasks-0.1.0-Setup.exe`). Direct links would need a
  version-free asset name in the release pipeline.
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
