import { Buffer } from "node:buffer"

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose"
import { NextResponse, type NextRequest } from "next/server"

import { isTelegramProfile, type TelegramProfile } from "@/lib/telegram"
import {
  decryptOidcCookie,
  encryptOidcCookie,
  getTelegramOidcConfig,
  isTelegramTransaction,
  oidcCookieOptions,
  safeStringEqual,
  TELEGRAM_CALLBACK_PATH,
  TELEGRAM_ISSUER,
  TELEGRAM_JWKS_ENDPOINT,
  TELEGRAM_PROFILE_COOKIE,
  TELEGRAM_PROFILE_MAX_AGE,
  TELEGRAM_TOKEN_ENDPOINT,
  TELEGRAM_TRANSACTION_COOKIE,
} from "@/lib/telegram-oidc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const telegramJwks = createRemoteJWKSet(new URL(TELEGRAM_JWKS_ENDPOINT), {
  timeoutDuration: 5_000,
  cooldownDuration: 30_000,
  cacheMaxAge: 60 * 60 * 1_000,
})

export async function GET(request: NextRequest) {
  let config: ReturnType<typeof getTelegramOidcConfig>

  try {
    config = getTelegramOidcConfig()
  } catch {
    return configurationErrorResponse()
  }

  const homeUrl = new URL(config.appUrl)
  const providerError = request.nextUrl.searchParams.get("error")
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const encryptedTransaction = request.cookies.get(
    TELEGRAM_TRANSACTION_COOKIE
  )?.value

  if (
    !state ||
    !/^[A-Za-z0-9_-]{32,200}$/.test(state) ||
    !encryptedTransaction
  ) {
    return redirectWithError(homeUrl, "invalid_request")
  }

  const transactionPayload = await decryptOidcCookie(encryptedTransaction)

  if (
    !isTelegramTransaction(transactionPayload) ||
    !safeStringEqual(transactionPayload.state, state) ||
    transactionPayload.redirectUri !== config.redirectUri
  ) {
    return redirectWithError(homeUrl, "invalid_state")
  }

  if (providerError) {
    return redirectWithError(homeUrl, "access_denied", true)
  }

  if (!code || code.length > 2048) {
    return redirectWithError(homeUrl, "invalid_request", true)
  }

  let tokenPayload: unknown

  try {
    const basicCredentials = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
      "utf8"
    ).toString("base64")
    const tokenResponse = await fetch(TELEGRAM_TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${basicCredentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
        code_verifier: transactionPayload.codeVerifier,
      }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })

    if (!tokenResponse.ok) {
      return redirectWithError(homeUrl, "token_exchange", true)
    }

    tokenPayload = await tokenResponse.json()
  } catch {
    return redirectWithError(homeUrl, "token_exchange", true)
  }

  const idToken = getIdToken(tokenPayload)

  if (!idToken) {
    return redirectWithError(homeUrl, "token_exchange", true)
  }

  let claims: JWTPayload

  try {
    const verifiedToken = await jwtVerify(idToken, telegramJwks, {
      issuer: TELEGRAM_ISSUER,
      audience: config.clientId,
      algorithms: ["RS256", "ES256"],
      requiredClaims: ["sub", "exp", "iat", "nonce"],
      clockTolerance: 5,
      maxTokenAge: "1 hour",
    })
    claims = verifiedToken.payload
  } catch {
    return redirectWithError(homeUrl, "verification", true)
  }

  if (
    typeof claims.nonce !== "string" ||
    !safeStringEqual(claims.nonce, transactionPayload.nonce)
  ) {
    return redirectWithError(homeUrl, "invalid_nonce", true)
  }

  const profile = getTelegramProfile(claims)

  if (!profile) {
    return redirectWithError(homeUrl, "invalid_profile", true)
  }

  try {
    const encryptedProfile = await encryptOidcCookie(
      profile,
      TELEGRAM_PROFILE_MAX_AGE
    )
    const response = NextResponse.redirect(
      new URL("/register", config.appUrl),
      303
    )
    response.headers.set("Cache-Control", "no-store, max-age=0")
    response.cookies.set(
      TELEGRAM_PROFILE_COOKIE,
      encryptedProfile,
      oidcCookieOptions("/register", TELEGRAM_PROFILE_MAX_AGE)
    )
    clearTransactionCookie(response)

    return response
  } catch {
    return redirectWithError(homeUrl, "session", true)
  }
}

function getIdToken(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return null
  }

  const tokenResponse = value as Record<string, unknown>

  return typeof tokenResponse.id_token === "string" &&
    tokenResponse.id_token.length <= 16_384
    ? tokenResponse.id_token
    : null
}

function getTelegramProfile(claims: JWTPayload): TelegramProfile | null {
  const id = getTelegramUserId(claims)
  const givenName = getOptionalString(claims.given_name, 128)
  const familyName = getOptionalString(claims.family_name, 128)
  const name =
    getOptionalString(claims.name, 512) ??
    ([givenName, familyName].filter(Boolean).join(" ").trim() || undefined)
  const picture = getOptionalString(claims.picture, 2048)
  const phoneNumber =
    claims.phone_number_verified === true
      ? getOptionalString(claims.phone_number, 32)
      : undefined
  const username = getOptionalString(claims.preferred_username, 64)

  if (!id || !name) {
    return null
  }

  if (picture && !isHttpsUrl(picture)) {
    return null
  }

  const profile: TelegramProfile = {
    id,
    name,
    ...(givenName ? { givenName } : {}),
    ...(familyName ? { familyName } : {}),
    ...(username ? { username } : {}),
    ...(picture ? { picture } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
  }

  return isTelegramProfile(profile) ? profile : null
}

function getTelegramUserId(claims: JWTPayload) {
  if (
    typeof claims.id === "number" &&
    Number.isSafeInteger(claims.id) &&
    claims.id > 0
  ) {
    return String(claims.id)
  }

  if (
    typeof claims.id === "string" &&
    /^[1-9]\d{0,31}$/.test(claims.id)
  ) {
    return claims.id
  }

  if (
    typeof claims.sub === "string" &&
    /^[1-9]\d{0,31}$/.test(claims.sub)
  ) {
    return claims.sub
  }

  return null
}

function getOptionalString(value: unknown, maxLength: number) {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) {
    return undefined
  }

  return value
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

function redirectWithError(
  homeUrl: URL,
  code: string,
  clearTransaction = false
) {
  homeUrl.searchParams.set("auth_error", code)
  const response = NextResponse.redirect(homeUrl, 303)
  response.headers.set("Cache-Control", "no-store, max-age=0")

  if (clearTransaction) {
    clearTransactionCookie(response)
  }

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

function clearTransactionCookie(response: NextResponse) {
  response.cookies.set(
    TELEGRAM_TRANSACTION_COOKIE,
    "",
    oidcCookieOptions(TELEGRAM_CALLBACK_PATH, 0)
  )
}
