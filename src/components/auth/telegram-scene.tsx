import { TelegramIcon } from "@/components/telegram-icon"

export function TelegramScene() {
  return (
    <section
      aria-hidden="true"
      className="scene-grid relative min-h-[28rem] overflow-hidden border-t border-sky-200/10 bg-[#06120e] lg:min-h-screen lg:border-t-0 lg:border-r"
    >
      <div className="absolute right-[12%] top-[14%] size-80 rounded-full bg-sky-500/12 blur-[110px]" />
      <div className="absolute bottom-[8%] left-[6%] size-96 rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="relative grid min-h-[28rem] place-items-center px-5 py-14 sm:px-10 lg:min-h-screen">
        <div className="scene-stage relative grid aspect-square w-full max-w-[31rem] place-items-center">
          <div className="absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/10" />
          <div className="absolute left-1/2 top-1/2 h-[88%] w-[42%] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[50%] border border-sky-300/10" />
          <div className="absolute left-1/2 top-1/2 h-[88%] w-[42%] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-[50%] border border-cyan-200/10" />

          <div className="relative grid size-40 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_24%,#c5f4ff_0%,#42b9f2_18%,#229ed9_44%,#1479ad_69%,#073b57_100%)] shadow-[inset_-24px_-28px_50px_rgba(2,20,35,0.62),inset_18px_20px_38px_rgba(224,247,255,0.42),0_38px_80px_rgba(34,158,217,0.3)] ring-1 ring-white/35 sm:size-56">
            <div className="absolute inset-[9%] rounded-full border border-white/20" />
            <TelegramIcon className="relative w-24 -translate-y-1 text-white drop-shadow-[0_12px_16px_rgba(2,44,70,0.35)] sm:w-28" />
            <div className="absolute -right-1 top-8 size-4 rounded-full bg-white/70 blur-[1px]" />
          </div>
        </div>
      </div>
    </section>
  )
}
