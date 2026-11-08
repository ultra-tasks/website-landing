# SEO and article plan

Working notes for growing organic search traffic to ultratasks.app without
breaking the site's promises: no cookies, no tracking or analytics in the app,
and an honest footer note about the one visit counter the website has
(Cloudflare Web Analytics, see the README). Written November 2026.

**How reliable this is.** The keyword ideas below come from spot-checking live
search results in November 2026, not from volume data. No keyword tool was
available. Before committing weeks to an article, check its query in Google
Search Console (once the site has impressions), Bing Webmaster Tools, or a
keyword tool, and favour the topics where Ultra Tasks has a real edge.

## What Ultra Tasks can honestly own

The app's differentiators, each taken from its docs and README:

1. Open source under the GNU AGPL-3.0-only (inherited Super Productivity code
   keeps its MIT notices), and no ads, analytics or telemetry in the app.
2. Offline-first: core features need no account and no connection.
3. UltraSync (beta since 0.3.0): private, end-to-end encrypted account sync,
   open source and self-hostable (Docker), with an account dashboard (two-factor,
   passkeys, recovery keys). The official service has closed sign-ups for now;
   the always-free plan and possible paid plans are the maintainer's promise,
   not a live offer, so keep them in the future tense and always mention the
   paid-plans possibility next to "free". WebDAV and OneDrive remain as basic
   alternatives.
4. Planning plus time tracking in one place: Today, Upcoming, Calendar, focus
   mode, estimates, boards.
5. Built-in importers for Todoist and TickTick.
6. A deliberately calm interface: no streaks, no constant alerts.

Always keep the honest caveats next to these claims: early development
(beta), Windows, macOS, Linux x64 and Android only (iOS and hosted web are "coming
soon"), UltraSync in beta with closed sign-ups and no independent cryptographic
review yet, collaboration not available, unsigned Windows builds and macOS
builds that are not notarized, and no app-store listings. Do not publish
detailed security or collaboration claims about UltraSync beyond what its
published design documents and release notes say.

## Status (6 November 2026)

Done (also 8 November 2026): a `/download/` page with per-platform direct
downloads, release notes snippet, Docker image and checksums, driven by
`data/release.json` (see "Downloads and releases" in the README), and a Sign in
link for UltraSync. Done: the on-page basics below, a static `/guides/` section (see "Guides" in
the README for how to add a page), the first guide ("Move from Todoist to Ultra
Tasks"), a sitemap that `npm run check` keeps complete, `sameAs` and
`screenshot` in the structured data, and `max-image-preview:large`.

Not done, and not possible from this repository: verifying the site in Google
Search Console and Bing Webmaster Tools, a `www` DNS record and redirect, a
redirect or noindex for the `pages.dev` copy of the site, GitHub topics and the
stale "planned website" line in the app README, and directory listings.

## Gaps the search results show

- **"Todoist alternative" queries** are held by directories (AlternativeTo,
  openalternative.co) and vendor listicles. Super Productivity, the app this
  one is forked from, already ranks well there, so "Todoist alternative" head
  terms are expensive. Go after narrower variants (encrypted, offline,
  self-hosted, no account).
- **"End-to-end encrypted to-do list"** returns mostly small or very new apps
  and a general encrypted-notes roundup. A privacy forum thread notes that
  popular open-source task managers can be self-hosted but are not encrypted.
  This is the clearest open lane for the project.
- **"Best offline to-do list for Windows, no account"** returns generic
  listicles that rarely say whether they tested anything. A first-hand,
  dated, honest comparison can beat them.
- **Time-blocking and planner queries** are dominated by calendar and
  time-tracker vendors. A calm, method-first guide that ends in a free tool
  has room.
- **Migration queries** ("export Todoist, import into X") are fragmented
  across help-centre pages. A step-by-step Todoist and TickTick guide matches
  features that already exist.
- **The brand name** has no exact match but several near neighbours (for
  example Ultra Todo, Checklist Ultra, Ultimate Tasks). Pair "Ultra Tasks"
  with "open source", "Windows" or "to-do" in titles and link text so the
  branded query resolves cleanly.

## Done in the redesign (on-page basics)

- Title and meta description carry the core terms (free, open-source, to-do
  list, planner, time tracker, Windows, macOS).
- One `h1`, keyword-bearing `h2`s, descriptive image alt text, explicit image
  dimensions, one hero image prioritised, the rest lazy-loaded.
- JSON-LD for `SoftwareApplication` and `WebSite` (no invented ratings).
- `sitemap.xml`, `robots.txt` sitemap line, canonical URL, Open Graph and
  Twitter card tags.
- Visible FAQ that answers real objections (free? offline? encryption? mobile?
  switching from Todoist?).

Still to do on-page:

- Add the site to Google Search Console and Bing Webmaster Tools by DNS
  verification. This adds no script to the pages.
- Once the domain is final, confirm every canonical and sitemap URL.
- Keep adding guides under `/guides/` (below). One long page cannot rank for
  many intents.

## Article avenues

Grouped by intent. "Bottom" means someone is close to choosing a tool.

### 1. Alternatives and comparisons (bottom of funnel)

| Working title | Target query idea | Angle |
| --- | --- | --- |
| Todoist alternatives that keep your tasks private | "private / encrypted Todoist alternative" | Table of options by where data lives, who can read it and what is self-hostable. Cite each product's own docs and date the review. |
| Ultra Tasks vs Todoist | "Ultra Tasks vs Todoist", "Todoist alternative open source" | Extends the page's existing comparison with workflow differences, pricing model and import steps. |
| Ultra Tasks vs TickTick | "TickTick alternative open source / offline" | Same format. Be fair about what TickTick does better (mobile apps, ecosystem). |
| Ultra Tasks vs Super Productivity | "Super Productivity alternative" and the brand's own relationship | Honest fork explainer: what changed, what is inherited, how data compatibility works. This is a trust page. |
| Best open-source to-do apps for Windows and Mac | "open source to-do list app" | Test each app, note licence, sync, offline behaviour. Include competitors, including the upstream project. |

### 2. Privacy and encryption (the open lane)

- **Is your to-do list private? What Todoist, TickTick and others can see.**
  Cite published security pages only; no speculation.
- **End-to-end encryption in a task app: what it covers and what it does not.**
  Write it as a general explainer plus what is true today (UltraSync's
  end-to-end encryption in beta). Describe UltraSync only as far as its
  documented design goes, including what metadata a server can see.
- **Sync your tasks without trusting a cloud:** UltraSync on your own server, or
  WebDAV. Step-by-step with screenshots.
- **Self-hosting UltraSync** (for the r/selfhosted audience): a guide that
  follows `ultra-tasks-server/deploy/README.md`, once someone has run the
  published image end to end. The download page already links the image and the
  setup guide.
- **What the AGPL means for a to-do app:** in plain words, what users and
  self-hosters can do, why it keeps the app and its sync open, and how upstream's
  MIT code fits. Link to `LICENSING.md` rather than paraphrasing the legal detail.
- **No account, no tracking: how Ultra Tasks keeps your data local.**
- **Pieces for UltraSync's wider launch:** an encrypted, open-source and
  self-hostable task sync with a free plan is a rare combination in search
  results. Prepare the announcement (sign-ups opening) and a comparison for that
  day. Write the collaboration guide only when collaboration ships.

### 3. Offline and platform intent

- **Best offline to-do list apps for Windows (no account needed).** Short
  testing method, dated, updated every few months.
- **A to-do app that works without internet** (a shorter evergreen page).
- **About the Windows SmartScreen and macOS Gatekeeper warnings.** The
  builds are unsigned or not notarized, so explain why, how to verify the
  checksum (`SHA256SUMS.txt`) and how to proceed. This answers a real
  conversion blocker honestly.

### 4. Method and how-to (top of funnel, broad)

Each ends with the feature that makes the method easy, not a hard sell.

- **Time blocking for people who hate rigid schedules.** Use Calendar and
  estimates. Gentle framing, consistent with the brand.
- **How to estimate how long tasks really take** (estimates versus tracked
  time).
- **A calm daily planning routine** (capture, choose, schedule, review). A
  weekly review checklist is a natural sibling.
- **Eisenhower matrix to-do template** using boards.
- **Pomodoro and focus sessions without the guilt.**
- **Persona pages in the style of "a day with Ultra Tasks"**: students,
  parents, freelancers, developers. Developer variant: tracking time against
  Jira, GitHub or GitLab issues.
- Be careful with condition-specific angles (for example ADHD). Write from
  first-hand use, avoid medical claims, and link to credible sources.

### 5. Switching guides (high intent, low competition)

- **Move from Todoist to Ultra Tasks** (published: built-in CSV importer in
  Settings, no API token; what carries over and what does not, such as
  recurrence rules, reminders and completed tasks). Do not promise a time like
  "five minutes".
- **Move from TickTick to Ultra Tasks** (built-in importer for the TickTick
  backup CSV; the app's wiki page 2.22 lists what carries over, including due
  times and next due dates of recurring tasks).
- A short "what does not carry over" box on each, because honesty here earns
  links and saves support time.

### 6. Reference and long tail (link-worthy)

- **Natural-language task entry cheat sheet:** `#tag`, `+project`, `20m`,
  `@friday`, `@every friday`. Printable, shareable.
- **Recurring task phrases** with copy-paste examples.
- **Keyboard shortcuts cheat sheet.**
- **Short syntax in other languages** (the app parses dates in several
  languages; a localised page targets non-English searches).

### 7. Open-source story (earned links)

- **Why we forked Super Productivity** and what a "calmer" interface changed.
- **Changelog posts** for each release (what is new, what is still beta).
- **Design notes:** how the Today, Upcoming and Calendar layouts evolved.
- These fit launch posts for Hacker News, r/selfhosted, r/opensource and
  privacy forums, which are also backlink sources.

## Suggested first six (about 90 days)

1. **Move from Todoist to Ultra Tasks**: easiest win; features exist now.
   Published 6 November 2026. Next: run a real Todoist export through the app
   and tighten the date section.
2. **End-to-end encryption in a task app: what it covers and what it does
   not**: owns the open lane and doubles as the privacy reference.
3. **Ultra Tasks vs Super Productivity**: resolves the most obvious trust
   question and captures branded intent.
4. **Best offline to-do apps for Windows (no account)**: tested, dated,
   honest.
5. **The natural-language entry cheat sheet**: small, shareable, and the page
   others link to.
6. **Time blocking for people who hate rigid schedules**: broad top-of-funnel
   with a clear path to Calendar and focus mode.

## Publishing mechanics

- Keep it a static site. Guides are `guides/<slug>/index.html` pages that share
  `styles.css`, with the same header and footer. `scripts/check.mjs` and
  `scripts/build.mjs` already cover every page, and `check` fails when a page is
  missing from `sitemap.xml`. When there are many guides, consider a small
  build-time template so the header and footer live in one place.
- Use `Article` structured data and a visible author and "last reviewed"
  date. Do not add `FAQPage`/`HowTo` markup unless the page really has that
  content; the redesign keeps visible FAQ text and no extra markup for it.
- Cross-link: every guide links to one relevant feature section and the
  download; the landing page links to the guides in the footer.
- Comparison pages must cite primary sources and show a review date, as the
  existing table does. See "Keeping claims current" in the repository README.
- Keep the privacy promise honest: add no analytics script of your own. The
  site already counts visits through Cloudflare Web Analytics, which Cloudflare
  injects and the footer discloses. Pair it with Search Console, Bing Webmaster
  Tools, GitHub release download counts and stars. Any new tracking must be
  disclosed in the same footer note before it ships.

## Distribution (cheap, repeatable)

- Create or update listings on AlternativeTo and openalternative.co. They
  rank for "alternative" queries and send comparison-minded visitors.
- Add the project to open-source and self-hosting lists where it fits, and
  answer relevant privacy-forum threads honestly, including beta limits.
- Publish each release with readable notes and link to the matching guide.
- Reuse the new screenshots and the short-syntax snippet in the GitHub
  README so the repository and the site tell the same story.
