# Telegram Bot Webhook Login Test

A dark, RTL-first Next.js App Router application that uses a Telegram bot deep link, webhook updates, inline confirmation buttons, and a dummy registration form. It does not use OIDC, the Telegram Login Widget, or a database.

## Stack

- Next.js App Router, React, TypeScript, and Tailwind CSS
- Shadcn UI
- Telegram Bot API over native `fetch`
- Short-lived HttpOnly browser cookie
- Vercel-ready Node.js Route Handlers

## Flow

1. The landing-page button generates a cryptographically random token with Web Crypto.
2. `POST /api/auth/telegram` stores that token in a 10-minute HttpOnly, SameSite cookie.
3. The browser opens `https://t.me/<BOT_USERNAME>?start=<TOKEN>` in a new tab.
4. Telegram sends the `/start` update to `/api/telegram/webhook`.
5. The webhook replies with **Confirm Login** and **Decline** inline buttons whose `callback_data` contains the token.
6. Confirming edits the Telegram message and sends a link to `/register?token=...&status=success&name=...&photo=...`.
7. `/register` accepts the profile only when the URL token matches the initiating browser cookie.
8. The dummy form prints its data to the browser console and opens a success dialog. Nothing is submitted or persisted.

## Telegram setup

1. Create a bot with [@BotFather](https://t.me/botfather).
2. Copy the bot token and username.
3. Copy the environment template:

```bash
cp .env.example .env.local
```

4. Configure the server:

```dotenv
TELEGRAM_BOT_TOKEN=123456789:your_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_SECRET=<WEBHOOK_SECRET>
NEXT_PUBLIC_APP_URL=https://your-public-domain.example
```

Generate a webhook secret with a cryptographically secure password manager or command-line utility. Use the same value in the environment and Telegram's `secret_token` parameter. Allowed characters are `A-Z`, `a-z`, `0-9`, `_`, and `-`.

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

Opening `setWebhook` in a browser exposes the bot token to browser history and extensions, so a trusted terminal is safer. If a browser is required, use a private window, close it immediately, and clear its history afterward.

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

- `/` — login button and Telegram return instructions
- `/api/auth/telegram` — creates the short-lived login-token cookie; its old OIDC behavior is disabled
- `/api/telegram/webhook` — handles `/start` and inline callback queries
- `/api/auth/callback/telegram` — disabled legacy OIDC endpoint
- `/register` — token-matched Telegram profile and dummy registration form

## Demo limitations

- The registration URL contains the token, name, and optional photo as required by this flow. URLs can be stored in browser history, proxy logs, analytics, and chat metadata.
- The standard Telegram Bot API `User` object does not normally include `photo_url`. The webhook accepts it when present and otherwise displays the user's initials.
- The browser-cookie match prevents casually opening somebody else's completion URL, but it is not a durable or fully server-verified production session. Use a short-lived signed server proof or a pending-login store for production authentication.
- Never log the bot token, webhook secret, or callback payload in production.
