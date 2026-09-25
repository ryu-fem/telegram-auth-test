import { Buffer } from "node:buffer"
import { timingSafeEqual } from "node:crypto"

import { NextResponse, type NextRequest } from "next/server"

import { readJsonBodyWithLimit } from "@/lib/request-body"
import { isHttpsImageUrl } from "@/lib/telegram"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TELEGRAM_API_BASE_URL = "https://api.telegram.org"
const WEBHOOK_SECRET_HEADER = "x-telegram-bot-api-secret-token"
const MAX_UPDATE_BYTES = 1_048_576
const PLACEHOLDER_BOT_TOKEN = "123456789:replace_with_your_bot_token"
const PLACEHOLDER_WEBHOOK_SECRETS = new Set([
  "replace_with_a_random_webhook_secret",
  "use_a_long_random_secret_here",
  "your_webhook_secret",
])

type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  is_bot?: boolean
}

type TelegramChat = {
  id: number
  type?: string
}

type TelegramMessage = {
  message_id: number
  text?: string
  from?: TelegramUser
  chat: TelegramChat
}

type TelegramCallbackQuery = {
  id: string
  data?: string
  from: TelegramUser
  message?: TelegramMessage
}

type TelegramUpdate = {
  message?: TelegramMessage
  callback_query?: TelegramCallbackQuery
}

type TelegramUserInfo = {
  id: string
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
}

export async function POST(request: NextRequest) {
  const webhookSecret = getWebhookSecret()

  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "Telegram webhook is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  if (
    !safeStringEqual(request.headers.get(WEBHOOK_SECRET_HEADER), webhookSecret)
  ) {
    return NextResponse.json(
      { ok: false, error: "Invalid webhook secret." },
      { status: 403, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)

  if (contentLength > MAX_UPDATE_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Update is too large." },
      { status: 413, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  const update = await readJsonBodyWithLimit(request, MAX_UPDATE_BYTES)

  if (update === undefined) {
    return NextResponse.json(
      { ok: false, error: "Invalid update." },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }

  try {
    await handleTelegramUpdate(update)
    return NextResponse.json(
      { ok: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  } catch {
    return NextResponse.json(
      { ok: false, error: "Telegram Bot API request failed." },
      { status: 502, headers: { "Cache-Control": "no-store, max-age=0" } }
    )
  }
}

async function handleTelegramUpdate(update: unknown) {
  if (!isTelegramUpdate(update)) {
    return
  }

  if (update.message) {
    await handleStartMessage(update.message)
  }

  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query)
  }
}

async function handleStartMessage(message: TelegramMessage) {
  const token = getStartToken(message.text)
  const user = message.from

  if (
    !token ||
    !user ||
    message.chat.type !== "private" ||
    message.chat.id !== user.id
  ) {
    return
  }

  await callTelegramApi("sendMessage", {
    chat_id: message.chat.id,
    text: "Confirm your website login:",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Confirm Login",
            callback_data: `confirm_${token}`,
          },
          {
            text: "Decline",
            callback_data: `decline_${token}`,
          },
        ],
      ],
    },
  })
}

async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery) {
  const callbackAction = getCallbackAction(callbackQuery.data)
  const message = callbackQuery.message
  const user = getTelegramUserInfo(callbackQuery.from)

  if (
    !callbackAction ||
    !message ||
    message.chat.type !== "private" ||
    message.chat.id !== callbackQuery.from.id ||
    message.from?.id !== getBotId() ||
    message.from?.is_bot !== true
  ) {
    await answerCallbackQuery(callbackQuery.id, "Unable to process this login")
    return
  }

  if (callbackAction.action === "decline") {
    await callTelegramApi("editMessageText", {
      chat_id: message.chat.id,
      message_id: message.message_id,
      text: "Login declined. You can close this window and return to the website.",
    })
    await answerCallbackQuery(callbackQuery.id, "Login declined")
    return
  }

  const registrationUrl = createRegistrationUrl(
    callbackAction.token,
    user
  )
  const successText =
    "Login confirmed successfully! You can close this window and return to the website."

  await callTelegramApi("editMessageText", {
    chat_id: message.chat.id,
    message_id: message.message_id,
    text: successText,
  })
  await callTelegramApi("sendMessage", {
    chat_id: message.chat.id,
    text: `${successText}\n\n${registrationUrl}`,
    reply_markup: {
      inline_keyboard: [[{ text: "Open Registration", url: registrationUrl }]],
    },
  })
  await answerCallbackQuery(callbackQuery.id, "Login confirmed")
}

function getStartToken(text?: string) {
  const match = text?.match(/^\/start\s+([A-Za-z0-9_-]{32,56})$/)
  return match?.[1]
}

function getCallbackAction(data?: string) {
  const match = data?.match(/^(confirm|decline)_([A-Za-z0-9_-]{32,56})$/)
  return match
    ? { action: match[1] as "confirm" | "decline", token: match[2] }
    : null
}

function createRegistrationUrl(
  token: string,
  user: TelegramUserInfo
) {
  const appUrl = new URL(getAppOrigin())
  const registrationUrl = new URL("/register", appUrl)

  registrationUrl.searchParams.set("token", token)
  registrationUrl.searchParams.set("status", "success")
  registrationUrl.searchParams.set("name", user.firstName)
  registrationUrl.searchParams.set("photo", user.photoUrl ?? "")

  return registrationUrl.toString()
}

function getTelegramUserInfo(user: TelegramUser): TelegramUserInfo {
  const lastName = getOptionalText(user.last_name, 256)
  const username = getOptionalText(user.username, 64)
  const photoUrl = isHttpsImageUrl(user.photo_url)
    ? user.photo_url
    : undefined

  return {
    id: String(user.id),
    firstName: user.first_name,
    ...(lastName ? { lastName } : {}),
    ...(username ? { username } : {}),
    ...(photoUrl ? { photoUrl } : {}),
  }
}

function isTelegramUpdate(value: unknown): value is TelegramUpdate {
  if (!isRecord(value)) {
    return false
  }

  return (
    (value.message === undefined || isTelegramMessage(value.message)) &&
    (value.callback_query === undefined ||
      isTelegramCallbackQuery(value.callback_query))
  )
}

function isTelegramMessage(value: unknown): value is TelegramMessage {
  if (!isRecord(value) || !isRecord(value.chat)) {
    return false
  }

  const chatId = value.chat.id
  const messageId = value.message_id
  const text = value.text
  const from = value.from

  return (
    typeof chatId === "number" &&
    Number.isSafeInteger(chatId) &&
    chatId > 0 &&
    (value.chat.type === undefined || typeof value.chat.type === "string") &&
    typeof messageId === "number" &&
    Number.isSafeInteger(messageId) &&
    (text === undefined || (typeof text === "string" && text.length <= 4_096)) &&
    (from === undefined || isTelegramUser(from))
  )
}

function isTelegramCallbackQuery(
  value: unknown
): value is TelegramCallbackQuery {
  if (!isRecord(value) || !isTelegramUser(value.from)) {
    return false
  }

  return (
    typeof value.id === "string" &&
    value.id.length <= 128 &&
    (value.data === undefined ||
      (typeof value.data === "string" && value.data.length <= 64)) &&
    (value.message === undefined || isTelegramMessage(value.message))
  )
}

function isTelegramUser(value: unknown): value is TelegramUser {
  if (!isRecord(value)) {
    return false
  }

  return (
    typeof value.id === "number" &&
    Number.isSafeInteger(value.id) &&
    value.id > 0 &&
    typeof value.first_name === "string" &&
    value.first_name.trim().length > 0 &&
    value.first_name.length <= 256 &&
    (value.last_name === undefined ||
      (typeof value.last_name === "string" && value.last_name.length <= 256)) &&
    (value.username === undefined ||
      (typeof value.username === "string" && value.username.length <= 64)) &&
    (value.photo_url === undefined ||
      (typeof value.photo_url === "string" && value.photo_url.length <= 2_048)) &&
    (value.is_bot === undefined || typeof value.is_bot === "boolean")
  )
}

async function callTelegramApi(method: string, payload: Record<string, unknown>) {
  const botToken = getBotToken()
  const response = await fetch(
    `${TELEGRAM_API_BASE_URL}/bot${botToken}/${method}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    }
  )
  const result: unknown = await response.json().catch(() => null)

  if (!response.ok || !isRecord(result) || result.ok !== true) {
    throw new Error("Telegram Bot API request failed")
  }
}

async function answerCallbackQuery(
  callbackQueryId: string,
  text: string
): Promise<void> {
  try {
    await callTelegramApi("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text,
      show_alert: false,
    })
  } catch {
    return
  }
}

function getBotToken() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()

  if (
    !botToken ||
    botToken === PLACEHOLDER_BOT_TOKEN ||
    !/^\d+:[A-Za-z0-9_-]{20,}$/.test(botToken)
  ) {
    throw new Error("TELEGRAM_BOT_TOKEN is missing or invalid")
  }

  return botToken
}

function getBotId() {
  const botId = Number(getBotToken().split(":", 1)[0])

  if (!Number.isSafeInteger(botId) || botId <= 0) {
    throw new Error("TELEGRAM_BOT_TOKEN has an invalid bot ID")
  }

  return botId
}

function getWebhookSecret() {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

  return secret &&
    !PLACEHOLDER_WEBHOOK_SECRETS.has(secret) &&
    /^[A-Za-z0-9_-]{16,256}$/.test(secret)
    ? secret
    : null
}

function getAppOrigin() {
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()

  if (!rawAppUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is missing")
  }

  const appUrl = new URL(rawAppUrl)
  const isLocalHttp =
    appUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(appUrl.hostname)

  if (appUrl.protocol !== "https:" && !isLocalHttp) {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS")
  }

  if (
    appUrl.username ||
    appUrl.password ||
    appUrl.search ||
    appUrl.hash
  ) {
    throw new Error("NEXT_PUBLIC_APP_URL must be an origin")
  }

  return appUrl.origin
}

function getOptionalText(value: unknown, maxLength: number) {
  return typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
    ? value
    : undefined
}

function safeStringEqual(first: string | null, second: string) {
  if (!first) {
    return false
  }

  const firstBuffer = Buffer.from(first, "utf8")
  const secondBuffer = Buffer.from(second, "utf8")

  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
