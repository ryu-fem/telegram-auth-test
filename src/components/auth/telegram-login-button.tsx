"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"

import { TelegramIcon } from "@/components/telegram-icon"
import { Button } from "@/components/ui/button"

const TOKEN_BYTES = 32

type TelegramLoginButtonProps = {
  botUsername?: string
}

export function TelegramLoginButton({
  botUsername,
}: TelegramLoginButtonProps) {
  const [isOpening, setIsOpening] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleLogin() {
    if (!botUsername) {
      setErrorMessage("Telegram bot username is not configured.")
      return
    }

    setErrorMessage(null)
    setIsOpening(true)

    const token = createLoginToken()
    const telegramWindow = window.open("about:blank", "_blank")

    if (telegramWindow) {
      telegramWindow.opener = null
    }

    try {
      const response = await fetch("/api/auth/telegram", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error("Unable to create the Telegram login session")
      }

      const botLink = `https://t.me/${encodeURIComponent(botUsername)}?start=${encodeURIComponent(token)}`

      if (telegramWindow) {
        telegramWindow.location.replace(botLink)
      } else {
        window.location.assign(botLink)
      }

      setHasOpened(true)
    } catch {
      telegramWindow?.close()
      setErrorMessage("Unable to open Telegram. Please try again.")
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-3">
      <Button
        type="button"
        onClick={handleLogin}
        disabled={isOpening || !botUsername}
        aria-busy={isOpening}
        className="h-14 w-full rounded-2xl bg-[#2AABEE] px-6 text-base font-bold text-[#061923] shadow-[0_18px_50px_rgba(42,171,238,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#42b9f2] hover:shadow-[0_22px_58px_rgba(42,171,238,0.3)] focus-visible:ring-[#42b9f2]/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <TelegramIcon className="size-6" />
        <span dir="ltr">
          {isOpening
            ? "Opening Telegram..."
            : hasOpened
              ? "Telegram opened"
              : "Login with Telegram"}
        </span>
      </Button>

      <p className="text-center text-xs leading-6 text-emerald-50/45" dir="ltr">
        Please return to this page after confirming the login inside Telegram.
      </p>

      {errorMessage ? (
        <p role="alert" className="text-center text-xs text-rose-200">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}

export function LoginSecurityNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-emerald-100/45">
      <ShieldCheck className="size-3.5 text-emerald-300/80" />
      <span>يتم تأكيد العملية داخل محادثة Telegram الخاصة دون حفظ بيانات التسجيل.</span>
    </p>
  )
}

function createLoginToken() {
  const bytes = window.crypto.getRandomValues(new Uint8Array(TOKEN_BYTES))
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return window
    .btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")
}
