import type { Metadata } from "next"

import { RegistrationForm } from "@/components/register/registration-form"

export const metadata: Metadata = {
  title: "إكمال التسجيل",
  description: "نموذج تسجيل تجريبي بعد مصادقة Telegram.",
}

export default function RegisterPage() {
  return <RegistrationForm />
}
