import { NextResponse, type NextRequest } from "next/server"

import { readJsonBodyWithLimit } from "@/lib/request-body"
import {
  isValidTelegramLoginToken,
  TELEGRAM_LOGIN_TOKEN_COOKIE,
  TELEGRAM_LOGIN_TOKEN_MAX_AGE,
} from "@/lib/telegram"

export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json(
    { error: "This authentication endpoint has been disabled." },
    { status: 410, headers: { "Cache-Control": "no-store, max-age=0" } }
  )
}

export async function POST(request: NextRequest) {
  const expectedOrigin = getExpectedOrigin()

  if (!expectedOrigin) {
    return configurationErrorResponse()
  }

  if (request.headers.get("origin") !== expectedOrigin) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (contentLength > 1_024) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  const body = await readJsonBodyWithLimit(request, 1_024)

  if (body === undefined) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  const token = isRecord(body) ? body.token : null

  if (!isValidTelegramLoginToken(token)) {
    return NextResponse.json(
      { error: "Invalid login token." },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  )
  response.cookies.set(
    TELEGRAM_LOGIN_TOKEN_COOKIE,
    token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TELEGRAM_LOGIN_TOKEN_MAX_AGE,
    }
  )

  return response
}

function getExpectedOrigin() {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!rawAppUrl) {
    return null
  }

  try {
    const appUrl = new URL(rawAppUrl)
    const isLocalHttp =
      appUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(appUrl.hostname)
    const isAllowed =
      appUrl.protocol === "https:" ||
      isLocalHttp

    if (
      !isAllowed ||
      appUrl.username ||
      appUrl.password ||
      appUrl.search ||
      appUrl.hash
    ) {
      return null
    }

    return appUrl.origin
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function configurationErrorResponse() {
  return NextResponse.json(
    { error: "Application URL is not configured." },
    { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
  )
}
