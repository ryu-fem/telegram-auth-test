import { Check, Fingerprint, ShieldCheck, Sparkles } from "lucide-react"

import { TelegramIcon } from "@/components/telegram-icon"

export function TelegramScene() {
  return (
    <section
      aria-hidden="true"
      className="scene-grid relative min-h-[30rem] overflow-hidden border-t border-emerald-200/10 bg-[#06120e] lg:min-h-screen lg:border-t-0 lg:border-r"
    >
      <div className="absolute -right-24 top-12 size-80 rounded-full bg-emerald-500/15 blur-[100px]" />
      <div className="absolute -bottom-24 -left-20 size-96 rounded-full bg-sky-500/10 blur-[110px]" />

      <div className="relative mx-auto flex min-h-[30rem] max-w-2xl flex-col items-center justify-center px-5 py-14 sm:px-10 lg:min-h-screen lg:py-20">
        <div className="mb-8 flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-100/80 backdrop-blur-xl">
          <Sparkles className="size-3.5 text-emerald-300" />
          <span>تسجيل دخول سريع وآمن</span>
        </div>

        <div className="scene-stage relative grid aspect-square w-full max-w-[29rem] place-items-center">
          <div className="absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/10" />
          <div className="absolute left-1/2 top-1/2 size-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-200/15" />
          <div className="absolute left-1/2 top-1/2 h-[88%] w-[42%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[50%] border border-sky-300/10" />
          <div className="absolute left-1/2 top-1/2 h-[88%] w-[42%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-[50%] border border-emerald-300/10" />
          <div className="absolute left-1/2 top-1/2 size-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="animate-float-slow absolute left-4 top-[18%] rounded-2xl border border-white/10 bg-[#0b2019]/85 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:left-2 sm:p-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-100/55">مصدر الهوية</p>
                <p className="mt-0.5 text-sm font-semibold text-white">Telegram</p>
              </div>
            </div>
          </div>

          <div className="animate-float-delayed absolute bottom-[14%] right-0 rounded-2xl border border-white/10 bg-[#0b2019]/85 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:right-1 sm:p-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-full bg-emerald-400 text-emerald-950 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
                <Check className="size-5" strokeWidth={3} />
              </div>
              <div>
                <p className="text-xs text-emerald-100/55">حالة الطلب</p>
                <p className="mt-0.5 text-sm font-semibold text-white">تم التحقق</p>
              </div>
            </div>
          </div>

          <div className="animate-float-fast absolute right-[2%] top-[42%] hidden rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-200 backdrop-blur-lg sm:block">
            Hash verified
          </div>

          <div className="relative grid size-40 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_24%,#a5f3fc_0%,#38bdf8_18%,#0ea5e9_44%,#0369a1_69%,#052e49_100%)] shadow-[inset_-24px_-28px_50px_rgba(2,20,35,0.62),inset_18px_20px_38px_rgba(224,247,255,0.42),0_38px_80px_rgba(14,165,233,0.3)] ring-1 ring-white/35 sm:size-52">
            <div className="absolute inset-[9%] rounded-full border border-white/20" />
            <TelegramIcon className="relative w-20 -translate-y-1 text-white drop-shadow-[0_12px_16px_rgba(2,44,70,0.35)] sm:w-24" />
            <div className="absolute -right-1 top-8 size-4 rounded-full bg-white/70 blur-[1px]" />
          </div>
        </div>

        <div className="mt-9 grid w-full max-w-lg grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 backdrop-blur-xl">
            <ShieldCheck className="mb-3 size-5 text-emerald-300" />
            <p className="text-sm font-semibold text-white">تحقق تشفيري</p>
            <p className="mt-1 text-xs leading-5 text-emerald-100/50">HMAC-SHA256</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.045] p-4 backdrop-blur-xl">
            <Fingerprint className="mb-3 size-5 text-sky-300" />
            <p className="text-sm font-semibold text-white">بيانات minimized</p>
            <p className="mt-1 text-xs leading-5 text-emerald-100/50">No database</p>
          </div>
        </div>
      </div>
    </section>
  )
}
