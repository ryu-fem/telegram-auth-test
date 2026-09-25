export const TELEGRAM_LOGIN_TOKEN_COOKIE = "telegram_webhook_login_token"
export const TELEGRAM_LOGIN_TOKEN_MAX_AGE = 10 * 60

export type TelegramLoginProfile = {
  name: string
  picture?: string
}

export function isValidTelegramLoginToken(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[A-Za-z0-9_-]{32,56}$/.test(value)
  )
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
