import { createHash, createHmac, timingSafeEqual } from "node:crypto"

import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const MAX_BODY_SIZE = 16 * 1024
const MAX_AUTH_AGE_SECONDS = 24 * 60 * 60
const ALLOWED_FIELDS = new Set([
  "id",
  "first_name",
  "last_name",
  "username",
  "photo_url",
  "auth_date",
  "hash",
])

type TelegramRequest = Record<string, unknown>

function jsonResponse(
  body: { success: boolean; message: string; user?: unknown },
  status: number
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  })
}

function isValidPhotoUrl(value: string) {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return jsonResponse(
      { success: false, message: "يجب إرسال البيانات بصيغة JSON." },
      415
    )
  }

  const requestOrigin = request.headers.get("origin")
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) {
    return jsonResponse(
      { success: false, message: "تم رفض مصدر الطلب." },
      403
    )
  }

  const contentLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_SIZE) {
    return jsonResponse(
      { success: false, message: "حجم الطلب أكبر من المسموح." },
      413
    )
  }

  let payload: TelegramRequest
  try {
    const rawBody = await request.text()
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_SIZE) {
      return jsonResponse(
        { success: false, message: "حجم الطلب أكبر من المسموح." },
        413
      )
    }

    const parsedBody: unknown = JSON.parse(rawBody)
    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      Array.isArray(parsedBody)
    ) {
      return jsonResponse(
        { success: false, message: "بيانات تلجرام غير صالحة." },
        400
      )
    }
    payload = parsedBody as TelegramRequest
  } catch {
    return jsonResponse(
      { success: false, message: "تعذر قراءة بيانات تلجرام." },
      400
    )
  }

  if (Object.keys(payload).some((key) => !ALLOWED_FIELDS.has(key))) {
    return jsonResponse(
      { success: false, message: "تحتوي البيانات على حقول غير مدعومة." },
      400
    )
  }

  const id = payload.id
  const firstName = payload.first_name
  const lastName = payload.last_name
  const username = payload.username
  const photoUrl = payload.photo_url
  const authDate = payload.auth_date
  const hash = payload.hash

  if (
    typeof id !== "number" ||
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    typeof firstName !== "string" ||
    firstName.length < 1 ||
    firstName.length > 128 ||
    (lastName !== undefined &&
      (typeof lastName !== "string" || lastName.length > 128)) ||
    (username !== undefined &&
      (typeof username !== "string" || username.length > 64)) ||
    (photoUrl !== undefined &&
      (typeof photoUrl !== "string" ||
        photoUrl.length > 2048 ||
        !isValidPhotoUrl(photoUrl))) ||
    typeof authDate !== "number" ||
    !Number.isInteger(authDate) ||
    authDate <= 0 ||
    typeof hash !== "string" ||
    !/^[a-f\d]{64}$/i.test(hash)
  ) {
    return jsonResponse(
      { success: false, message: "بيانات تلجرام غير مكتملة أو غير صالحة." },
      400
    )
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  if (!botToken) {
    return jsonResponse(
      { success: false, message: "خدمة التحقق غير مهيأة على الخادم." },
      500
    )
  }

  const dataCheckFields: Record<string, string> = {
    id: String(id),
    first_name: firstName,
    auth_date: String(authDate),
  }

  if (lastName !== undefined) {
    dataCheckFields.last_name = lastName
  }
  if (username !== undefined) {
    dataCheckFields.username = username
  }
  if (photoUrl !== undefined) {
    dataCheckFields.photo_url = photoUrl
  }

  const dataCheckString = Object.entries(dataCheckFields)
    .sort(([firstKey], [secondKey]) =>
      firstKey < secondKey ? -1 : firstKey > secondKey ? 1 : 0
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  const secretKey = createHash("sha256").update(botToken).digest()
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest()
  const receivedHash = Buffer.from(hash.toLowerCase(), "hex")

  if (
    receivedHash.length !== expectedHash.length ||
    !timingSafeEqual(receivedHash, expectedHash)
  ) {
    return jsonResponse(
      { success: false, message: "تعذر التحقق من صحة تسجيل الدخول." },
      401
    )
  }

  const currentTimestamp = Math.floor(Date.now() / 1000)
  if (Math.abs(currentTimestamp - authDate) > MAX_AUTH_AGE_SECONDS) {
    return jsonResponse(
      { success: false, message: "انتهت صلاحية بيانات تسجيل الدخول." },
      401
    )
  }

  return jsonResponse(
    {
      success: true,
      message: "تم التحقق من هوية Telegram بنجاح.",
      user: {
        id,
        firstName,
        ...(lastName !== undefined ? { lastName } : {}),
        ...(username !== undefined ? { username } : {}),
        ...(photoUrl !== undefined ? { photoUrl } : {}),
        authDate,
      },
    },
    200
  )
}
