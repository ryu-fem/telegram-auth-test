import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const disabledResponse = () =>
  NextResponse.json(
    { error: "This authentication endpoint has been disabled." },
    { status: 410, headers: { "Cache-Control": "no-store, max-age=0" } }
  )

export function GET() {
  return disabledResponse()
}

export function POST() {
  return disabledResponse()
}
