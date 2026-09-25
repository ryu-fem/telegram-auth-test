"use client"

import Script from "next/script"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { LoaderCircle, ShieldAlert } from "lucide-react"

import { TelegramIcon } from "@/components/telegram-icon"
import { Button } from "@/components/ui/button"
import {
  isTelegramProfile,
  TELEGRAM_PROFILE_STORAGE_KEY,
  type TelegramAuthPayload,
  type TelegramAuthResponse,
} from "@/lib/telegram"

type TelegramLoginOptions = {
  bot_id: number
  request_access: "write"
  lang: "ar"
}

type TelegramLoginApi = {
  init: (
    options: TelegramLoginOptions,
    callback: (user: TelegramAuthPayload | false) => void
  ) => void
  open: () => void
}

declare global {
  interface Window {
    Telegram?: {
      Login?: TelegramLoginApi
    }
  }
}

type LoginStatus = "idle" | "verifying"

export function TelegramLoginButton() {
  const router = useRouter()
  const [status, setStatus] = useState<LoginStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const botIdValue = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID ?? ""
  const botId = Number(botIdValue)
  const hasValidBotId =
    /^\d+$/.test(botIdValue) && Number.isSafeInteger(botId) && botId > 0

  const handleTelegramAuth = useCallback(
    async (telegramUser: TelegramAuthPayload | false) => {
      if (!telegramUser) {
        return
      }

      setStatus("verifying")
      setError(null)

      try {
        const response = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(telegramUser),
        })

        const result = (await response
          .json()
          .catch(() => null)) as TelegramAuthResponse | null

        if (!response.ok || !result?.success || !isTelegramProfile(result.user)) {
          throw new Error(result?.message ?? "تعذر التحقق من بيانات تلجرام.")
        }

        window.sessionStorage.setItem(
          TELEGRAM_PROFILE_STORAGE_KEY,
          JSON.stringify(result.user)
        )
        router.push("/register")
      } catch (requestError) {
        setStatus("idle")
        setError(
          requestError instanceof Error
            ? requestError.message
            : "تعذر الاتصال بخدمة التحقق. حاول مرة أخرى."
        )
      }
    },
    [router]
  )

  const initializeWidget = useCallback(() => {
    if (!hasValidBotId || !window.Telegram?.Login) {
      return
    }

    window.Telegram.Login.init(
      {
        bot_id: botId,
        request_access: "write",
        lang: "ar",
      },
      handleTelegramAuth
    )
  }, [botId, handleTelegramAuth, hasValidBotId])

  useEffect(() => {
    initializeWidget()
    router.prefetch("/register")
  }, [initializeWidget, router])

  function openTelegramLogin() {
    setError(null)

    if (!hasValidBotId) {
      setError("يلزم ضبط NEXT_PUBLIC_TELEGRAM_BOT_ID قبل تشغيل التطبيق.")
      return
    }

    if (!window.Telegram?.Login) {
      setError("لم يتم تحميل Telegram Login Widget بعد. حاول مرة أخرى.")
      return
    }

    window.Telegram.Login.open()
  }

  return (
    <div className="w-full max-w-md" dir="rtl">
      <Button
        type="button"
        onClick={openTelegramLogin}
        disabled={!hasValidBotId || status === "verifying"}
        aria-describedby="telegram-login-status"
        className="h-14 w-full rounded-2xl bg-[#2AABEE] px-6 text-base font-bold text-[#061923] shadow-[0_18px_50px_rgba(42,171,238,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#42b9f2] hover:shadow-[0_22px_58px_rgba(42,171,238,0.3)] focus-visible:ring-[#42b9f2]/40"
      >
        {status === "verifying" ? (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            <span>جارٍ التحقق من الهوية</span>
          </>
        ) : (
          <>
            <TelegramIcon className="size-6" />
            <span dir="ltr">Log in with Telegram</span>
          </>
        )}
      </Button>

      <p
        id="telegram-login-status"
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-center text-sm text-rose-300"
      >
        {!hasValidBotId
          ? "إعداد Bot ID مفقود. أضف متغير البيئة ثم أعد تشغيل Next.js."
          : error}
      </p>

      <Script
        src="https://telegram.org/js/telegram-widget.js?22"
        strategy="afterInteractive"
        onLoad={initializeWidget}
        onError={() => setError("تعذر تحميل Telegram Login Widget. تحقق من الاتصال.")}
      />
    </div>
  )
}

export function LoginSecurityNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-emerald-100/45">
      <ShieldAlert className="size-3.5" />
      <span>يتم التحقق من البيانات على الخادم ولا يتم حفظها.</span>
    </p>
  )
}
