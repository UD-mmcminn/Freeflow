import { Response } from 'express'
import { getAuthConfig } from './auth.config'

const buildCookieOptions = (expiryMinutes: number) => {
    const config = getAuthConfig()
    return {
        httpOnly: config.cookies.httpOnly,
        secure: config.cookies.secure,
        sameSite: config.cookies.sameSite,
        maxAge: expiryMinutes * 60 * 1000,
        path: '/'
    } as const
}

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
    const config = getAuthConfig()
    res.cookie(config.cookies.accessTokenName, accessToken, buildCookieOptions(config.accessTokenExpiryMinutes))
    res.cookie(config.cookies.refreshTokenName, refreshToken, buildCookieOptions(config.refreshTokenExpiryMinutes))
}

export const clearAuthCookies = (res: Response): void => {
    const config = getAuthConfig()
    const options = {
        httpOnly: config.cookies.httpOnly,
        secure: config.cookies.secure,
        sameSite: config.cookies.sameSite,
        path: '/'
    } as const
    res.clearCookie(config.cookies.accessTokenName, options)
    res.clearCookie(config.cookies.refreshTokenName, options)
}
