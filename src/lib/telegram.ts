export const TELEGRAM_PROFILE_STORAGE_KEY = "telegram-verified-profile"

export type TelegramAuthPayload = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export type TelegramProfile = {
  id: number
  firstName: string
  lastName?: string
  username?: string
  photoUrl?: string
  authDate: number
}

export type TelegramAuthResponse =
  | {
      success: true
      message: string
      user: TelegramProfile
    }
  | {
      success: false
      message: string
    }

export function isTelegramProfile(value: unknown): value is TelegramProfile {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const profile = value as Record<string, unknown>

  return (
    typeof profile.id === "number" &&
    Number.isSafeInteger(profile.id) &&
    profile.id > 0 &&
    typeof profile.firstName === "string" &&
    profile.firstName.length > 0 &&
    typeof profile.authDate === "number" &&
    Number.isInteger(profile.authDate) &&
    profile.authDate > 0 &&
    (profile.lastName === undefined || typeof profile.lastName === "string") &&
    (profile.username === undefined || typeof profile.username === "string") &&
    (profile.photoUrl === undefined || typeof profile.photoUrl === "string")
  )
}
