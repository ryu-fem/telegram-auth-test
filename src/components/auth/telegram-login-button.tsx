import { ShieldCheck } from "lucide-react"

import { TelegramIcon } from "@/components/telegram-icon"
import { Button } from "@/components/ui/button"

export function TelegramLoginButton() {
  return (
    <form action="/api/auth/telegram" method="get" className="w-full max-w-md">
      <Button
        type="submit"
        className="h-14 w-full rounded-2xl bg-[#2AABEE] px-6 text-base font-bold text-[#061923] shadow-[0_18px_50px_rgba(42,171,238,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#42b9f2] hover:shadow-[0_22px_58px_rgba(42,171,238,0.3)] focus-visible:ring-[#42b9f2]/40"
      >
        <TelegramIcon className="size-6" />
        <span dir="ltr">Log in with Telegram</span>
      </Button>
    </form>
  )
}

export function LoginSecurityNote() {
  return (
    <p className="flex items-center justify-center gap-2 text-xs text-emerald-100/45">
      <ShieldCheck className="size-3.5" />
      <span>يتم التحقق من هوية Telegram والرمز الموقّع على الخادم ولا يتم حفظها.</span>
    </p>
  )
}
