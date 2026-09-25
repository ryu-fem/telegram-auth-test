import { TelegramIcon } from "@/components/telegram-icon"

export function TelegramLoginButton() {
  const href = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=login`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      aria-label="Log in with Telegram (opens in a new tab)"
      className="flex h-14 w-full max-w-md items-center justify-center gap-3 rounded-2xl bg-[#229ED9] px-6 text-base font-bold text-white shadow-[0_18px_45px_rgba(34,158,217,0.28)] transition-[transform,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[#1B8FC9] hover:shadow-[0_22px_52px_rgba(34,158,217,0.36)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#229ED9]/35"
    >
      <TelegramIcon className="size-6 shrink-0" />
      <span>Log in with Telegram</span>
    </a>
  )
}
