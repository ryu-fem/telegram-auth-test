export const TELEGRAM_LOGIN_START_PARAM = "login"

export type TelegramLoginProfile = {
  name: string
  picture?: string
}

export function isHttpsImageUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2_048) {
    return false
  }

  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}
