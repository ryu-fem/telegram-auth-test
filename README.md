# Telegram OIDC Auth Test

A dark, RTL-first Next.js App Router application using Telegram's OpenID Connect Authorization Code Flow. After authentication, it opens a dummy registration form at 30% completion with a success dialog. It does not use a database or submit the form to a server.

## Stack

- Next.js App Router and React
- Tailwind CSS v4
- Shadcn UI
- OIDC Authorization Code Flow with PKCE (`S256`)
- `jose` signature verification and encrypted JWT cookies
- Vercel-ready Node.js Route Handlers

## Telegram setup

1. Create or choose a bot in [@BotFather](https://t.me/botfather).
2. Open **Bot Settings → Web Login**.
3. Add the exact callback URL as an allowed URL:

```text
https://your-domain.example/api/auth/callback/telegram
```

4. If using Telegram's Web Login tooling elsewhere, also add the website origin. Allowed URLs and the Client ID/Secret are provided in the same BotFather section.
5. Save the **Client ID** and **Client Secret** securely. The Client Secret is not a BotFather bot token.

Telegram's OIDC documentation is available at [core.telegram.org/bots/telegram-login](https://core.telegram.org/bots/telegram-login).

## Local setup

1. Copy the environment template:

```bash
cp .env.example .env.local
```

2. Configure the values:

```dotenv
TELEGRAM_CLIENT_ID=123456789
TELEGRAM_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Add the matching local callback to BotFather when the provider accepts local development URLs:

```text
http://localhost:3000/api/auth/callback/telegram
```

4. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Restart the development server after changing environment variables.

## Authentication flow

1. The browser opens `GET /api/auth/telegram` through a normal server-backed form.
2. The server generates `state`, `nonce`, and a PKCE verifier/challenge, then stores the transaction in a 10-minute encrypted HttpOnly cookie.
3. Telegram receives the authorization request with `scope=openid profile phone` and redirects back to `/api/auth/callback/telegram`.
4. The callback validates `state`, exchanges the code server-side with HTTP Basic client authentication, and verifies the ID token through Telegram's JWKS, issuer, audience, timestamps, and `nonce`.
5. The verified profile is stored in a 15-minute encrypted HttpOnly cookie and the browser is redirected to `/register`.
6. The server decrypts and validates the profile before rendering the dummy form. The form is not submitted or persisted.

Cookie encryption and PKCE transaction storage avoid a database for this test. The profile cookie is an HttpOnly, SameSite cookie; `Secure` is enabled in production. The verified profile is limited to the test flow and is not a complete production session or authorization system.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Deploy to Vercel

Set these variables under **Project Settings → Environment Variables** for the Production environment:

```text
TELEGRAM_CLIENT_ID
TELEGRAM_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

`NEXT_PUBLIC_APP_URL` must be the deployed HTTPS origin. Register its exact callback with BotFather before testing:

```text
https://your-domain.example/api/auth/callback/telegram
```

Keep `TELEGRAM_CLIENT_SECRET` server-only. It is read by the Node.js Route Handlers to exchange the authorization code and derive the encrypted-cookie key.

## Routes

- `/` — RTL split-screen Telegram login
- `/register` — server-validated dummy registration form and success dialog
- `/api/auth/telegram` — OIDC authorization start route
- `/api/auth/callback/telegram` — code exchange, ID-token verification, and profile-cookie creation
