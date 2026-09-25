import { hkdfSync, timingSafeEqual } from "node:crypto"

import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose"

export const TELEGRAM_AUTHORIZATION_ENDPOINT =
  "https://oauth.telegram.org/auth"
export const TELEGRAM_TOKEN_ENDPOINT = "https://oauth.telegram.org/token"
export const TELEGRAM_JWKS_ENDPOINT =
  "https://oauth.telegram.org/.well-known/jwks.json"
export const TELEGRAM_ISSUER = "https://oauth.telegram.org"
export const TELEGRAM_CALLBACK_PATH = "/api/auth/callback/telegram"
export const TELEGRAM_TRANSACTION_COOKIE = "telegram_oidc_transaction"
export const TELEGRAM_PROFILE_COOKIE = "telegram_oidc_profile"
export const TELEGRAM_TRANSACTION_MAX_AGE = 10 * 60
export const TELEGRAM_PROFILE_MAX_AGE = 15 * 60

export type TelegramOidcConfig = {
  clientId: string
  clientSecret: string
  appUrl: string
  redirectUri: string
}

export type TelegramTransaction = {
  state: string
  nonce: string
  codeVerifier: string
  redirectUri: string
}

export function getTelegramOidcConfig(): TelegramOidcConfig {
  const clientId = process.env.TELEGRAM_CLIENT_ID?.trim()
  const clientSecret = process.env.TELEGRAM_CLIENT_SECRET?.trim()
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!clientId || !/^\d+$/.test(clientId)) {
    throw new Error("TELEGRAM_CLIENT_ID is missing or invalid")
  }

  if (!clientSecret || clientSecret.length < 16) {
    throw new Error("TELEGRAM_CLIENT_SECRET is missing or invalid")
  }

  if (!rawAppUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is missing")
  }

  const parsedAppUrl = new URL(rawAppUrl)
  const isLocalHttp =
    parsedAppUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(parsedAppUrl.hostname)

  if (parsedAppUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS")
  }

  if (
    parsedAppUrl.username ||
    parsedAppUrl.password ||
    parsedAppUrl.search ||
    parsedAppUrl.hash
  ) {
    throw new Error("NEXT_PUBLIC_APP_URL must be an origin without credentials")
  }

  const appUrl = parsedAppUrl.origin

  return {
    clientId,
    clientSecret,
    appUrl,
    redirectUri: `${appUrl}${TELEGRAM_CALLBACK_PATH}`,
  }
}

export function oidcCookieOptions(path: string, maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path,
    maxAge,
  }
}

export async function encryptOidcCookie(
  payload: JWTPayload,
  maxAgeSeconds: number
) {
  const now = Math.floor(Date.now() / 1000)

  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + maxAgeSeconds)
    .encrypt(getCookieEncryptionKey())
}

export async function decryptOidcCookie(token: string) {
  try {
    const { payload } = await jwtDecrypt(token, getCookieEncryptionKey(), {
      keyManagementAlgorithms: ["dir"],
      contentEncryptionAlgorithms: ["A256GCM"],
      clockTolerance: 5,
    })

    return payload
  } catch {
    return null
  }
}

export function isTelegramTransaction(
  value: unknown
): value is TelegramTransaction {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const transaction = value as Record<string, unknown>

  return (
    typeof transaction.state === "string" &&
    transaction.state.length >= 32 &&
    transaction.state.length <= 200 &&
    typeof transaction.nonce === "string" &&
    transaction.nonce.length >= 32 &&
    transaction.nonce.length <= 200 &&
    typeof transaction.codeVerifier === "string" &&
    transaction.codeVerifier.length >= 43 &&
    transaction.codeVerifier.length <= 128 &&
    typeof transaction.redirectUri === "string" &&
    transaction.redirectUri.length > 0 &&
    transaction.redirectUri.length <= 2048
  )
}

export function safeStringEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first)
  const secondBuffer = Buffer.from(second)

  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  )
}

function getCookieEncryptionKey() {
  const clientSecret = process.env.TELEGRAM_CLIENT_SECRET?.trim()

  if (!clientSecret) {
    throw new Error("TELEGRAM_CLIENT_SECRET is missing")
  }

  return new Uint8Array(
    hkdfSync(
      "sha256",
      Buffer.from(clientSecret, "utf8"),
      Buffer.from("telegram-oidc-auth-test", "utf8"),
      Buffer.from("encrypted-cookie-a256gcm-v1", "utf8"),
      32
    )
  )
}
