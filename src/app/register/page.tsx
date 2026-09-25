import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { RegistrationForm } from "@/components/register/registration-form"
import { isTelegramProfile } from "@/lib/telegram"
import {
  decryptOidcCookie,
  TELEGRAM_PROFILE_COOKIE,
} from "@/lib/telegram-oidc"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "إكمال التسجيل",
  description: "نموذج تسجيل تجريبي بعد مصادقة Telegram OIDC.",
}

export default async function RegisterPage() {
  const cookieStore = await cookies()
  const encryptedProfile = cookieStore.get(TELEGRAM_PROFILE_COOKIE)?.value

  if (!encryptedProfile) {
    redirect("/?auth_error=session")
  }

  const profile = encryptedProfile
    ? await decryptOidcCookie(encryptedProfile)
    : null

  if (!isTelegramProfile(profile)) {
    redirect("/?auth_error=session")
  }

  return <RegistrationForm profile={profile} />
}
