import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

function disabledEndpoint() {
  return NextResponse.json(
    { error: "This authentication endpoint has been disabled." },
    { status: 410, headers: { "Cache-Control": "no-store, max-age=0" } }
  )
}

export const GET = disabledEndpoint
export const POST = disabledEndpoint
