# Telegram Bot Webhook Login

A database-free Next.js App Router application with a clean RTL split-screen landing page, a direct Telegram deep link, webhook updates, inline confirmation buttons, and a test registration form.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Telegram Bot API over native `fetch`
- Vercel-ready Node.js Route Handlers
- No OIDC, Telegram Login Widget, or database

## Flow

1. The landing page opens `https://t.me/<BOT_USERNAME>?start=login` in a new tab.
2. Telegram sends the `/start login` update to `/api/telegram/webhook`.
3. The webhook replies with **Confirm Login** and **Decline** inline buttons.
4. Declining edits the Telegram message and stops the flow.
5. Confirming sends a link to `/register?token=login&status=success&name=...&photo=...`.
6. The registration page reads the confirmed Telegram profile and displays its test form.
7. Submitting prints the form data to the browser console and opens a success dialog. Nothing is submitted or persisted.

## Telegram setup

1. Create a bot with [@BotFather](https://t.me/botfather).
2. Copy its token and username.
3. Copy the environment template:

```bash
cp .env.example .env.local
```

4. Configure the environment:

```dotenv
TELEGRAM_BOT_TOKEN=123456789:your_bot_token
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_SECRET=<WEBHOOK_SECRET>
NEXT_PUBLIC_APP_URL=https://your-public-domain.example
```

Set `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` without the leading `@`. Because Next.js exposes `NEXT_PUBLIC_*` values to the browser, set it before `npm run dev` or `npm run build`.

Generate a webhook secret with a cryptographically secure password manager or command-line utility. Use the same value in the environment and Telegram's `secret_token` parameter. Allowed secret characters are `A-Z`, `a-z`, `0-9`, `_`, and `-`.

`NEXT_PUBLIC_APP_URL` must match the origin serving the landing page. Telegram cannot deliver webhooks to an ordinary localhost server, so local testing requires an HTTPS tunnel and its public URL.

## Register the webhook from a browser

After deploying the app, open this URL in a private browser window:

```text
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https%3A%2F%2Fyour-public-domain.example%2Fapi%2Ftelegram%2Fwebhook&secret_token=<WEBHOOK_SECRET>&allowed_updates=%5B%22message%22%2C%22callback_query%22%5D
```

A successful browser response contains `"ok":true`. The registered HTTPS URL must point to:

```text
https://your-public-domain.example/api/telegram/webhook
```

Opening `setWebhook` in a browser exposes the bot token to browser history and extensions. Use a trusted terminal when possible; if a browser is required, use a private window and clear its history afterward.

A safer terminal equivalent is:

```bash
curl --request POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  --data-urlencode "url=${NEXT_PUBLIC_APP_URL}/api/telegram/webhook" \
  --data-urlencode "secret_token=${TELEGRAM_WEBHOOK_SECRET}" \
  --data-urlencode 'allowed_updates=["message","callback_query"]'
```

Telegram sends the configured secret in the `X-Telegram-Bot-Api-Secret-Token` request header. The webhook rejects requests without a constant-time matching value.

## Run locally

```bash
npm install
npm run dev
```

Open the same `NEXT_PUBLIC_APP_URL` origin configured in `.env.local`. Restart the development server after changing environment variables.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Routes

- `/` — clean landing page and Telegram login link
- `/api/telegram/webhook` — handles `/start login` and inline callback queries
- `/register` — Telegram profile and test registration form
- `/api/auth/telegram` — disabled legacy login-session endpoint
- `/api/auth/callback/telegram` — disabled legacy OIDC endpoint

## Demo limitations

- The static `/start=login` link has no per-browser session proof because this project intentionally uses no database or server-side login store. The registration URL can be manually constructed and is not production authentication.
- The registration URL contains the name and optional photo. URLs can be stored in browser history, proxy logs, analytics, and chat metadata.
- The standard Telegram Bot API `User` object does not normally include `photo_url`. The webhook accepts it when present and otherwise displays the user's initials.
- Use a short-lived signed server proof or a pending-login store before using this flow for real authentication.
- Never log the bot token, webhook secret, or callback payload in production.
