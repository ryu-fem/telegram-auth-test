"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { TelegramIcon } from "@/components/telegram-icon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import type { TelegramLoginProfile } from "@/lib/telegram"

type RegistrationData = {
  firstName: string
  middleName: string
  lastName: string
  phone: string
  parentPhone: string
  studiesInEgypt: boolean
}

type RegistrationFormProps = {
  profile: TelegramLoginProfile | null
}

const INITIAL_FORM_DATA: RegistrationData = {
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  parentPhone: "",
  studiesInEgypt: false,
}

const inputClassName =
  "h-12 rounded-xl border-white/10 bg-[#06100d]/70 px-4 text-sm text-white shadow-none placeholder:text-emerald-50/25 focus-visible:border-emerald-300/50 focus-visible:ring-emerald-300/15"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return `${parts[0]?.[0] ?? "T"}${parts[1]?.[0] ?? ""}`
}

export function RegistrationForm({ profile }: RegistrationFormProps) {
  const router = useRouter()
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
  const [formData, setFormData] = useState<RegistrationData>(
    INITIAL_FORM_DATA
  )

  function updateField<Key extends keyof RegistrationData>(
    field: Key,
    value: RegistrationData[Key]
  ) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    console.log("[Registration test only]", formData)
    setIsSuccessOpen(true)
  }

  if (!profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#050d0a] px-6 py-12">
        <Card className="w-full max-w-md items-center gap-5 rounded-[2rem] border-white/10 bg-[#081711]/90 p-8 text-center shadow-2xl shadow-black/30">
          <div className="grid size-16 place-items-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-200">
            <LockKeyhole className="size-7" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">
              جلسة Telegram غير صالحة
            </h1>
            <p className="text-sm leading-7 text-emerald-50/50">
              افتح رابط تسجيل الدخول من هذه الصفحة، ثم أكّد الدخول داخل Telegram
              قبل فتح صفحة التسجيل.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push("/")}
            className="h-12 w-full rounded-xl bg-[#2AABEE] font-bold text-[#061923] hover:bg-[#42b9f2]"
          >
            <TelegramIcon className="size-5" />
            العودة إلى تسجيل الدخول
          </Button>
        </Card>
      </main>
    )
  }

  const displayName = profile.name

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-[#050d0a] px-4 py-6 text-white sm:px-6 lg:px-8 lg:py-10"
    >
      <div className="pointer-events-none absolute right-[-10rem] top-[-12rem] size-[32rem] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-14rem] left-[-10rem] size-[30rem] rounded-full bg-sky-500/[0.07] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between px-1 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-sky-300/20 bg-sky-400/10 text-[#42b9f2]">
              <TelegramIcon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Telegram Access</p>
              <p className="text-[11px] text-emerald-100/40">التسجيل التجريبي</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="h-7 border-white/10 bg-white/[0.04] px-3 text-[11px] text-emerald-100/60"
          >
            الخطوة 1 من 3
          </Badge>
        </header>

        <Card className="gap-0 overflow-hidden rounded-[2rem] border-white/10 bg-[#081711]/88 py-0 shadow-[0_32px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl">
          <div className="border-b border-white/8 px-5 py-5 sm:px-8 lg:px-10">
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">التقدم في التسجيل</span>
              <span className="font-bold text-emerald-300">30%</span>
            </div>
            <Progress
              value={30}
              aria-label="التقدم في التسجيل: 30 بالمئة"
              className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-emerald-950 [&_[data-slot=progress-indicator]]:bg-gradient-to-l [&_[data-slot=progress-indicator]]:from-emerald-400 [&_[data-slot=progress-indicator]]:to-emerald-600"
            />
          </div>

          <div className="flex flex-col lg:flex-row">
            <aside className="relative overflow-hidden border-b border-white/8 bg-emerald-300/[0.025] p-6 sm:p-8 lg:w-[36%] lg:border-b-0 lg:border-l lg:p-10">
              <div className="absolute -left-20 -top-20 size-52 rounded-full bg-emerald-400/10 blur-3xl" />
              <div className="relative flex h-full flex-col">
                <div className="mb-7 flex items-center gap-2 text-xs font-semibold text-emerald-200">
                  <ShieldCheck className="size-4" />
                  تم تأكيد الدخول عبر Telegram
                </div>

                <div className="flex items-center gap-4">
                  <Avatar className="size-20 rounded-[1.6rem] border-2 border-emerald-300/25 shadow-[0_16px_40px_rgba(16,185,129,0.18)] sm:size-24">
                    {profile.picture ? (
                      <AvatarImage
                        src={profile.picture}
                        alt={`صورة ${displayName}`}
                        className="rounded-[1.45rem]"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-[1.45rem] bg-emerald-400 text-xl font-black text-emerald-950">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold text-white sm:text-2xl">
                      {displayName}
                    </h2>
                    <p className="mt-1 truncate text-sm text-emerald-100/45" dir="ltr">
                      Telegram Web Login
                    </p>
                    <Badge className="mt-3 h-6 bg-emerald-400/12 px-2.5 text-[11px] text-emerald-200">
                      <CheckCircle2 className="size-3" />
                      تم التأكيد
                    </Badge>
                  </div>
                </div>

                <div className="my-8 hidden h-px bg-gradient-to-l from-emerald-300/20 to-transparent lg:block" />

                <div className="mt-auto hidden space-y-4 lg:block">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="grid size-10 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                      <Fingerprint className="size-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">مسار التأكيد</p>
                      <p className="mt-0.5 text-xs text-emerald-50/40">Telegram Bot Webhook</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-4">
                    <div className="grid size-10 place-items-center rounded-xl bg-sky-400/10 text-sky-300">
                      <Sparkles className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">تجربة فقط</p>
                      <p className="mt-0.5 text-xs text-emerald-50/40">لن يتم حفظ النموذج</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="p-5 sm:p-8 lg:w-[64%] lg:p-10">
              <div className="mb-8">
                <p className="mb-2 text-xs font-semibold text-emerald-300">البيانات الشخصية</p>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  أكمل بيانات التسجيل
                </h1>
                <p className="mt-2 text-sm leading-7 text-emerald-50/45">
                  أدخل بياناتك التجريبية للمتابعة إلى الخطوة التالية.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-emerald-50/80">
                      الاسم الأول
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(event) =>
                        updateField("firstName", event.target.value)
                      }
                      autoComplete="given-name"
                      minLength={2}
                      maxLength={128}
                      required
                      placeholder="مثال: أحمد"
                      className={inputClassName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-emerald-50/80">
                      الاسم الأوسط
                    </Label>
                    <Input
                      id="middleName"
                      name="middleName"
                      value={formData.middleName}
                      onChange={(event) =>
                        updateField("middleName", event.target.value)
                      }
                      autoComplete="additional-name"
                      maxLength={128}
                      placeholder="اختياري"
                      className={inputClassName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-emerald-50/80">
                      الاسم الأخير
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(event) =>
                        updateField("lastName", event.target.value)
                      }
                      autoComplete="family-name"
                      minLength={2}
                      maxLength={128}
                      required
                      placeholder="مثال: محمد"
                      className={inputClassName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-emerald-50/80">
                      رقم الهاتف
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      value={formData.phone}
                      onChange={(event) => updateField("phone", event.target.value)}
                      autoComplete="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      className={`${inputClassName} text-left`}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="parentPhone" className="text-emerald-50/80">
                      رقم هاتف ولي الأمر
                    </Label>
                    <Input
                      id="parentPhone"
                      name="parentPhone"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      value={formData.parentPhone}
                      onChange={(event) =>
                        updateField("parentPhone", event.target.value)
                      }
                      autoComplete="tel"
                      required
                      placeholder="01xxxxxxxxx"
                      className={`${inputClassName} max-w-sm text-left`}
                    />
                  </div>
                </div>

                <div className="flex min-h-20 items-center justify-between gap-4 rounded-2xl border border-emerald-300/12 bg-emerald-300/[0.045] p-4">
                  <div>
                    <Label
                      htmlFor="studiesInEgypt"
                      className="text-sm text-emerald-50/85"
                    >
                      طالب يدرس في مصر
                    </Label>
                    <p className="mt-1.5 text-xs text-emerald-50/40">
                      فعّل الخيار إذا كنت تدرس داخل مصر.
                    </p>
                  </div>
                  <Switch
                    id="studiesInEgypt"
                    checked={formData.studiesInEgypt}
                    onCheckedChange={(checked) =>
                      updateField("studiesInEgypt", checked)
                    }
                    aria-label="طالب يدرس في مصر"
                    className="h-7 w-12 bg-white/10 data-checked:bg-emerald-400"
                  />
                </div>

                <div className="grid gap-3 border-t border-white/8 pt-7 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => router.push("/")}
                    className="h-12 rounded-xl bg-amber-400 font-bold text-amber-950 shadow-[0_14px_35px_rgba(251,191,36,0.12)] hover:bg-amber-300"
                  >
                    <ArrowRight className="size-4" />
                    السابق
                  </Button>
                  <Button
                    type="submit"
                    className="h-12 rounded-xl bg-emerald-400 font-bold text-emerald-950 shadow-[0_14px_35px_rgba(52,211,153,0.14)] hover:bg-emerald-300"
                  >
                    التالي
                    <ArrowLeft className="size-4" />
                  </Button>
                </div>

                <p className="flex items-center justify-center gap-2 text-center text-xs text-emerald-50/35">
                  <LockKeyhole className="size-3.5" />
                  لا يتم إرسال بيانات النموذج إلى أي خادم أو قاعدة بيانات.
                </p>
              </form>
            </section>
          </div>
        </Card>
      </div>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md overflow-hidden rounded-[2rem] border-emerald-300/15 bg-[#0a1b15] p-0 text-white shadow-2xl shadow-black/50"
        >
          <div className="relative overflow-hidden px-7 py-8 text-center sm:px-9">
            <div className="absolute left-1/2 top-0 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative mx-auto mb-5 grid size-18 place-items-center rounded-3xl border border-emerald-300/25 bg-emerald-400/15 text-emerald-300 shadow-[0_18px_50px_rgba(52,211,153,0.18)]">
              <CheckCircle2 className="size-9" strokeWidth={2.2} />
            </div>
            <DialogHeader className="relative text-center">
              <DialogTitle className="text-xl font-black text-white sm:text-2xl">
                تم التسجيل بنجاح! (تجربة فقط)
              </DialogTitle>
              <DialogDescription className="mx-auto mt-3 max-w-xs leading-7 text-emerald-50/50">
                تمت عملية التسجيل التجريبية فقط، وتم طباعة البيانات في Console.
              </DialogDescription>
            </DialogHeader>
            <Button
              type="button"
              onClick={() => setIsSuccessOpen(false)}
              className="relative mt-7 h-11 w-full rounded-xl bg-emerald-400 font-bold text-emerald-950 hover:bg-emerald-300"
            >
              تم
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}
