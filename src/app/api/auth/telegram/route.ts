import { createHash, randomBytes } from "node:crypto"

import { NextResponse } from "next/server"

import {
  encryptOidcCookie,
  getTelegramOidcConfig,
  oidcCookieOptions,
  TELEGRAM_AUTHORIZATION_ENDPOINT,
  TELEGRAM_CALLBACK_PATH,
  TELEGRAM_PROFILE_COOKIE,
  TELEGRAM_TRANSACTION_COOKIE,
  TELEGRAM_TRANSACTION_MAX_AGE,
  type TelegramTransaction,
} from "@/lib/telegram-oidc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  let config: ReturnType<typeof getTelegramOidcConfig>

  try {
    config = getTelegramOidcConfig()
  } catch {
    return configurationErrorResponse()
  }

  const state = randomBytes(32).toString("base64url")
  const nonce = randomBytes(32).toString("base64url")
  const codeVerifier = randomBytes(64).toString("base64url")
  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")
  const transaction: TelegramTransaction = {
    state,
    nonce,
    codeVerifier,
    redirectUri: config.redirectUri,
  }

  let encryptedTransaction: string
  try {
    encryptedTransaction = await encryptOidcCookie(
      transaction,
      TELEGRAM_TRANSACTION_MAX_AGE
    )
  } catch {
    return redirectWithError(new URL(config.appUrl), "configuration")
  }

  const authorizationUrl = `${TELEGRAM_AUTHORIZATION_ENDPOINT}?client_id=${encodeURIComponent(config.clientId)}&redirect_uri=${encodeURIComponent(config.redirectUri)}&response_type=code&scope=${encodeURIComponent("openid profile phone")}&state=${encodeURIComponent(state)}&nonce=${encodeURIComponent(nonce)}&code_challenge=${encodeURIComponent(codeChallenge)}&code_challenge_method=S256&lang=ar`
  const response = NextResponse.redirect(authorizationUrl)
  response.headers.set("Cache-Control", "no-store, max-age=0")
  response.cookies.set(
    TELEGRAM_TRANSACTION_COOKIE,
    encryptedTransaction,
    oidcCookieOptions(TELEGRAM_CALLBACK_PATH, TELEGRAM_TRANSACTION_MAX_AGE)
  )
  response.cookies.set(
    TELEGRAM_PROFILE_COOKIE,
    "",
    oidcCookieOptions("/register", 0)
  )

  return response
}

function redirectWithError(url: URL, code: string) {
  url.searchParams.set("auth_error", code)
  const response = NextResponse.redirect(url, 303)
  response.headers.set("Cache-Control", "no-store, max-age=0")
  return response
}

function configurationErrorResponse() {
  return new Response("Telegram authentication is not configured.", {
    status: 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}
