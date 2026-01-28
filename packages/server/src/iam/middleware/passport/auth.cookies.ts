/*
 * Copyright (c) 2026 Union Dynamic, Inc
 *
 * This source code is licensed under the "IAM Module License" (AGPLv3 + AI Clause).
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the LICENSE file in this directory for the full license text and
 * restrictions regarding Artificial Intelligence training.
 */

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
