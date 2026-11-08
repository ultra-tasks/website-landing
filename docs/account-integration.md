# Account entry point

The header of every page (home, download, guides) has a Sign in link, and the home page's UltraSync card and the download page's self-hosting section repeat it. The build points them at the account server's `/account?view=login` page, where users can sign in, manage devices and recovery, and (once enrolment opens) create an account. The marketing site does not handle passwords or encryption keys.

`PUBLIC_ACCOUNT_URL` chooses the target when building the website:

- Unset: the official dashboard, `https://app.ultratasks.app` (published with Ultra Tasks 0.3.0).
- Set to an empty value: the links are removed, for example to take them down quickly.
- Set to an invalid value (a path, credentials, no scheme): ignored with a warning in the build log, and the official dashboard is used, so a typo in the hosting settings cannot stop the website from deploying.
- Set to an HTTPS origin: that server, such as a self-hosted installation. Credentials, paths, query strings, and fragments are rejected; HTTP is accepted only for loopback development. For example, `PUBLIC_ACCOUNT_URL=http://localhost:1900 npm run build` connects a local preview to the Docker development dashboard.

There is no Sign up link: new registrations on the official server are closed until outgoing account email and the operator privacy notice are finalized. When enrolment opens, add `data-account-link="signup"` links (the build already supports them) and update the sign-up wording on the home and download pages. A future web task application can be served separately alongside the account dashboard.
