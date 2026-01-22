export type AuthCookieConfig = {
    accessTokenName: string
    refreshTokenName: string
    secure: boolean
    sameSite: 'lax' | 'strict' | 'none'
    httpOnly: boolean
}

export type AuthConfig = {
    accessTokenSecret: string
    refreshTokenSecret: string
    accessTokenExpiryMinutes: number
    refreshTokenExpiryMinutes: number
    sessionSecret: string
    cookies: AuthCookieConfig
}

const parseNumber = (value: string | undefined, fallback: number): number => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) return fallback
    return value.toLowerCase() === 'true'
}

const requireEnv = (key: string, fallback?: string): string => {
    const value = process.env[key] ?? fallback
    if (!value) {
        throw new Error(`Missing required env: ${key}`)
    }
    return value
}

export const getAuthConfig = (): AuthConfig => {
    const secureCookies = parseBoolean(process.env.SECURE_COOKIES, false)
    return {
        accessTokenSecret: requireEnv('JWT_AUTH_TOKEN_SECRET', process.env.JWT_AUTH_TOKEN_SECRET),
        refreshTokenSecret: requireEnv('JWT_REFRESH_TOKEN_SECRET', process.env.JWT_REFRESH_TOKEN_SECRET),
        accessTokenExpiryMinutes: parseNumber(process.env.JWT_TOKEN_EXPIRY_IN_MINUTES, 60),
        refreshTokenExpiryMinutes: parseNumber(process.env.JWT_REFRESH_TOKEN_EXPIRY_IN_MINUTES, 60 * 24 * 90),
        sessionSecret: requireEnv('EXPRESS_SESSION_SECRET', 'flowise'),
        cookies: {
            accessTokenName: 'token',
            refreshTokenName: 'refreshToken',
            secure: secureCookies,
            sameSite: 'lax',
            httpOnly: true
        }
    }
}

export default getAuthConfig
