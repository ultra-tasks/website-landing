# Ultra Tasks website

The public Ultra Tasks landing page: a small, responsive static website in plain
HTML, CSS, and JavaScript. Teal is the primary color, with warm white surfaces
and terracotta highlights. There are no dependencies, third-party fonts,
analytics, tracking scripts, cookies, or background API requests.

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
image attributes, and the absence of remote scripts. `build` copies the public
files into `dist/`. Deploy the contents of `dist/` to any static host. No server
runtime, credentials, or build service is required in production. Canonical and
social URLs currently use the planned `https://ultratasks.app` domain; update
the metadata in `index.html` if the final domain differs.

## Content and interaction

- An everyday-life introduction with three clear statements and compact,
  illustrative task, focus, and privacy snippets. Real light/dark screenshots
  remain linked, and the planner screenshot appears in the page.
- A keyboard-accessible mobile menu and native FAQ disclosures. The content,
  links, snippets, and FAQ remain usable without JavaScript.
- Privacy, local storage, end-to-end encrypted sync, open source, and self-hosting.
- A sourced comparison with Todoist and TickTick.
- The mission, download links, GitHub links, and upstream attribution.
- Explicit platform status, so planned clients are not presented as downloads.

Public app links point to <https://github.com/ultra-tasks/ultra-tasks>.

## Screenshots and branding

`assets/logo.svg` is the app's own Ultra Tasks logo, copied from
`super-tasks/src/assets/ultra-tasks/logo.svg`.

`assets/app-today.jpg`, `assets/app-dark.jpg`, and `assets/app-planner.jpg` are
actual screenshots of the locally built Ultra Tasks 0.1.0 web interface, captured
in a separate browser session with fictional tasks created for this website.
They contain no personal task data. They show the current development build;
the released desktop interface may differ. Keep their dimensions and alt text
in sync when replacing them. The small feature illustrations are HTML/CSS
illustrations, not app screenshots.

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

## Front-page design validation

The compact static-snippet layout and a manual three-panel carousel were
compared at desktop and phone widths. Both fit without page overflow and the
carousel controls worked. Static snippets were selected because tasks, focus,
and privacy stay visible together without requiring interaction. The hero no
longer contains a full application-window screenshot. Temporary experiment
files and comparison captures are kept under the ignored `.tmp/designs/`.

## Cloudflare Pages deployment

Connect the `ultra-tasks/website-landing` repository to Cloudflare Pages:

- Production branch: `main`
- Framework preset: None
- Build command: `npm run check && npm run build`
- Build output directory: `dist`
- Root directory: repository root
- Node.js: 22, selected through `.node-version`

Cloudflare's Git integration deploys new commits pushed to `main` and creates
preview deployments for other branches. The build includes validation before
publishing. No deployment token or GitHub Actions secret is needed. Attach
`ultratasks.app` in the project's Custom domains settings; Cloudflare manages
the Pages DNS record and HTTPS certificate after activation. Do not deploy the
repository root: only `dist/` contains the public site files.
