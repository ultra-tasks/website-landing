# Account entry point

Set `PUBLIC_ACCOUNT_URL` to the verified HTTPS origin of the Ultra Tasks account server when building the website. The header's Sign in link then opens that server's `/account?view=login` page, where users can sign in, create an account, verify email, and manage devices and recovery. The marketing site does not handle passwords or encryption keys.

An unset value keeps account links hidden until the service is ready. Credentials, paths, query strings, and fragments are rejected; HTTP is accepted only for loopback development. For example, `PUBLIC_ACCOUNT_URL=http://localhost:1900 npm run build` connects a local preview to the Docker development dashboard.

Production backend URL, SMTP delivery, privacy policy, supported-client acceptance, and the limited beta must be ready before setting the production value. This change does not publish or provision the Oracle backend. A future web task application can be served separately alongside the account dashboard.
