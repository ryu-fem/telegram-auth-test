import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Telegram Access | تجربة تسجيل الدخول",
    template: "%s | Telegram Access",
  },
  description:
    "تجربة عملية لمصادقة تلجرام ونموذج تسجيل تجريبي بدون قاعدة بيانات.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`dark ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
