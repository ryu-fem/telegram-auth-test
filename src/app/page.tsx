import { TelegramLoginButton } from "@/components/auth/telegram-login-button"
import { TelegramScene } from "@/components/auth/telegram-scene"

export default function Home() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050d0a] text-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(34,158,217,0.12),transparent_65%)]" />

      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <section className="order-1 flex w-full items-center px-5 py-16 sm:px-10 lg:w-[52%] lg:px-14 xl:px-20">
          <div className="w-full max-w-xl">
            <h1 className="text-4xl font-black leading-[1.2] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              سجّل دخولك بسهولة عبر <span className="text-[#42b9f2]">Telegram</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-emerald-50/60 sm:text-lg">
              افتح Telegram، أكّد عملية الدخول، ثم ارجع إلى هذه الصفحة لإكمال التسجيل.
            </p>

            <div className="mt-10">
              <TelegramLoginButton />
            </div>
          </div>
        </section>

        <div className="order-2 w-full lg:w-[48%]">
          <TelegramScene />
        </div>
      </div>
    </main>
  )
}
