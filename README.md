# Telegram OAuth Test

A dark, RTL-first Next.js App Router application that verifies Telegram Login data and opens a dummy registration form. It does not use a database or send registration data to a server.

## Stack

- Next.js App Router and React
- Tailwind CSS v4
- Shadcn UI
- Node.js `crypto` HMAC-SHA256 verification
- Vercel-ready serverless Route Handler

## Local setup

1. Create a bot with [@BotFather](https://t.me/botfather).
2. Send `/setdomain` to BotFather and register the exact public origin used by the app. Plain `localhost` can be rejected; for local widget testing, use an HTTPS tunnel and register its public URL.
3. Copy the environment template:

```bash
cp .env.example .env.local
```

4. Set the bot token and its numeric ID. The numeric ID is the part before `:` in the bot token:

```dotenv
TELEGRAM_BOT_TOKEN=123456789:your_secret_token
NEXT_PUBLIC_TELEGRAM_BOT_ID=123456789
```

5. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Restart the dev server after changing a `NEXT_PUBLIC_` variable.

## Verification

The client posts the widget payload to `POST /api/auth/telegram`. The Node.js Route Handler:

1. Allows only Telegram's documented login fields.
2. Rejects oversized, malformed, or cross-origin requests.
3. Rebuilds the sorted `data-check-string`.
4. Calculates `HMAC-SHA256(dataCheckString, SHA256(botToken))`.
5. Compares the result with the supplied hash using `timingSafeEqual`.
6. Rejects authentication data older than 24 hours.

Only the sanitized profile is returned. The hash and bot token never reach `sessionStorage`. Because this test intentionally creates no server session or database, the browser profile is for display only and is not production-grade authorization.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Deploy to Vercel

Run these commands from the project directory:

```bash
npx vercel
npx vercel env add TELEGRAM_BOT_TOKEN production
npx vercel env add NEXT_PUBLIC_TELEGRAM_BOT_ID production
npx vercel --prod
```

Vercel prompts for each secret value. Alternatively, add both variables under **Project Settings → Environment Variables** for the Production environment. `TELEGRAM_BOT_TOKEN` must stay server-only and must not use a `NEXT_PUBLIC_` prefix.

After the first production deployment:

1. Copy the production URL, such as `https://telegram-auth-test.vercel.app`.
2. Send `/setdomain` to [@BotFather](https://t.me/botfather) and register that exact origin.
3. Redeploy if Telegram or the environment variables were changed.

`NEXT_PUBLIC_TELEGRAM_BOT_ID` is embedded in the client bundle at build time, so changing it requires a new production build. The token is read only by the serverless Route Handler.

## Routes

- `/` — RTL split-screen Telegram login
- `/register` — 30% dummy registration form and success dialog
- `/api/auth/telegram` — serverless Telegram hash verification
