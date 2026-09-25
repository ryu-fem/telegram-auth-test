import type { Metadata } from "next"

import { RegistrationForm } from "@/components/register/registration-form"
import {
  isHttpsImageUrl,
  TELEGRAM_LOGIN_START_PARAM,
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
  const status = getParameter(params.status)
  const token = getParameter(params.token)
  const name = normalizeName(getParameter(params.name))
  const photo = getParameter(params.photo)
  const isConfirmedLogin =
    status === "success" && token === TELEGRAM_LOGIN_START_PARAM
  const profile: TelegramLoginProfile | null =
    isConfirmedLogin && name
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
