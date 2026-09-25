import { ArrowLeft, DatabaseZap, LockKeyhole, ShieldCheck } from "lucide-react"

import {
  LoginSecurityNote,
  TelegramLoginButton,
} from "@/components/auth/telegram-login-button"
import { TelegramScene } from "@/components/auth/telegram-scene"
import { TelegramIcon } from "@/components/telegram-icon"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050d0a] text-white"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_65%)]" />
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <section className="order-1 flex w-full flex-col px-5 py-6 sm:px-10 lg:w-[54%] lg:px-14 xl:px-20">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl border border-sky-300/20 bg-sky-400/10 text-[#42b9f2] shadow-[0_12px_32px_rgba(14,165,233,0.12)]">
                <TelegramIcon className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide text-white">Telegram Access</p>
                <p className="mt-0.5 text-xs text-emerald-100/45">تجربة المصادقة</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="h-7 border-emerald-300/15 bg-emerald-300/[0.06] px-3 text-[11px] font-semibold text-emerald-200"
            >
              TEST MODE
            </Badge>
          </header>

          <div className="flex flex-1 flex-col justify-center py-16 sm:py-20">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-200">
              <ShieldCheck className="size-3.5" />
              <span>بدون قاعدة بيانات</span>
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.25] tracking-[-0.04em] text-white sm:text-5xl lg:text-[3.65rem]">
              أنشئ حسابك <span className="text-emerald-300">الآن</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50/60 sm:text-lg">
              سجل دخولك باستخدام تلجرام لتجربة عملية التسجيل
            </p>

            <div className="mt-9">
              <TelegramLoginButton />
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-emerald-50/45">
              <span className="flex items-center gap-2">
                <LockKeyhole className="size-4 text-emerald-300/80" />
                تحقق من الهوية
              </span>
              <span className="flex items-center gap-2">
                <DatabaseZap className="size-4 text-emerald-300/80" />
                لا يتم حفظ البيانات
              </span>
            </div>

            <div className="mt-8">
              <LoginSecurityNote />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/8 pt-5 text-xs text-emerald-50/35">
            <span>Next.js · Serverless · Vercel</span>
            <a
              href="#flow"
              className="flex items-center gap-2 transition-colors hover:text-emerald-200"
            >
              كيف تعمل التجربة
              <ArrowLeft className="size-3.5" />
            </a>
          </div>
        </section>

        <div id="flow" className="order-2 w-full lg:w-[46%]">
          <TelegramScene />
        </div>
      </div>
    </main>
  )
}
