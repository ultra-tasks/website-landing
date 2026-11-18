# Account entry point

The header of every page (home, download, guides) has a Sign in link, and the home page's UltraSync card and the download page's self-hosting section repeat it. The build points them at the account server's `/account?view=login` page, where users can sign in and manage devices and recovery. The marketing site does not handle passwords or encryption keys.

`PUBLIC_ACCOUNT_URL` chooses the target when building the website:

- Unset: the official dashboard, `https://app.ultratasks.app` (published with Ultra Tasks 0.3.0).
- Set to an empty value: the links are removed, for example to take them down quickly.
- Set to an invalid value (a path, credentials, no scheme): ignored with a warning in the build log, and the official dashboard is used, so a typo in the hosting settings cannot stop the website from deploying.
- Set to an HTTPS origin: that server, such as a self-hosted installation. Credentials, paths, query strings, and fragments are rejected; HTTP is accepted only for loopback development. For example, `PUBLIC_ACCOUNT_URL=http://localhost:1900 npm run build` connects a local preview to the Docker development dashboard.

Official registration opened on 17 November 2026 after the maintainer's approval, SMTP authentication and the privacy notice were checked. The UltraSync card, FAQ and download page offer `data-account-link="signup"` links, which the build points at `/account?view=signup`. Email verification, privacy consent and rate limits remain enabled. Turnstile is optional and is not configured on the official deployment. The hosted web task application is live at the same origin root (`https://app.ultratasks.app/`) as a local-only build; account sync is available in installed apps. `/account` remains the dashboard and sign-up entry point.
