import { timingSafeEqual } from "node:crypto"

import type { Metadata } from "next"
import { cookies } from "next/headers"

import { RegistrationForm } from "@/components/register/registration-form"
import {
  isHttpsImageUrl,
  isValidTelegramLoginToken,
  TELEGRAM_LOGIN_TOKEN_COOKIE,
  type TelegramLoginProfile,
} from "@/lib/telegram"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "إكمال التسجيل",
  description: "نموذج تسجيل تجريبي بعد تأكيد الدخول عبر Telegram Bot.",
}

type RegisterPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  const cookieStore = await cookies()
  const token = getParameter(params.token)
  const cookieToken = cookieStore.get(TELEGRAM_LOGIN_TOKEN_COOKIE)?.value
  const status = getParameter(params.status)
  const name = normalizeName(getParameter(params.name))
  const photo = getParameter(params.photo)
  const hasValidToken =
    status === "success" &&
    isValidTelegramLoginToken(token) &&
    isValidTelegramLoginToken(cookieToken) &&
    safeStringEqual(token, cookieToken)
  const profile: TelegramLoginProfile | null =
    hasValidToken && name
      ? {
          name,
          ...(isHttpsImageUrl(photo) ? { picture: photo } : {}),
        }
      : null

  return <RegistrationForm profile={profile} />
}

function getParameter(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeName(value: string | undefined) {
  if (!value) {
    return null
  }

  const normalizedName = value.trim()

  return normalizedName.length > 0 && normalizedName.length <= 256
    ? normalizedName
    : null
}

function safeStringEqual(first: string, second: string) {
  const firstBuffer = Buffer.from(first, "utf8")
  const secondBuffer = Buffer.from(second, "utf8")

  return (
    firstBuffer.length === secondBuffer.length &&
    timingSafeEqual(firstBuffer, secondBuffer)
  )
}
