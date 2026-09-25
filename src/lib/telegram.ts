export type TelegramProfile = {
  id: string
  name: string
  givenName?: string
  familyName?: string
  username?: string
  picture?: string
  phoneNumber?: string
}

export function isTelegramProfile(value: unknown): value is TelegramProfile {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const profile = value as Record<string, unknown>

  return (
    typeof profile.id === "string" &&
    /^[1-9]\d{0,31}$/.test(profile.id) &&
    typeof profile.name === "string" &&
    profile.name.trim().length > 0 &&
    profile.name.length <= 512 &&
    (profile.givenName === undefined ||
      (typeof profile.givenName === "string" &&
        profile.givenName.length <= 128)) &&
    (profile.familyName === undefined ||
      (typeof profile.familyName === "string" &&
        profile.familyName.length <= 128)) &&
    (profile.username === undefined ||
      (typeof profile.username === "string" &&
        profile.username.length <= 64)) &&
    (profile.picture === undefined ||
      (typeof profile.picture === "string" &&
        profile.picture.length <= 2048 &&
        isHttpsUrl(profile.picture))) &&
    (profile.phoneNumber === undefined ||
      (typeof profile.phoneNumber === "string" &&
        profile.phoneNumber.length <= 32))
  )
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:"
  } catch {
    return false
  }
}
