import type { SVGProps } from "react"

export function TelegramIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M21.67 3.27 18.54 18.07c-.23 1.02-.84 1.27-1.7.79l-4.7-3.46-2.27 2.19c-.25.25-.46.46-.95.46l.34-4.8L17.85 6.2c.39-.34-.08-.53-.6-.19L6.16 12.48l-4.65-1.38c-1.01-.32-1.03-1.02.21-1.5l19.2-7.4c.89-.33 1.67.2 1.38 1.34Z" />
    </svg>
  )
}
