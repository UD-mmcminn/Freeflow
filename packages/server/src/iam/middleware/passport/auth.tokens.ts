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

import jwt from 'jsonwebtoken'
import { JwtPayload } from '../../Interface.Iam'
import { getAuthConfig } from './auth.config'

export const signAccessToken = (payload: JwtPayload): string => {
    const config = getAuthConfig()
    return jwt.sign(payload, config.accessTokenSecret, {
        expiresIn: `${config.accessTokenExpiryMinutes}m`
    })
}

export const signRefreshToken = (payload: JwtPayload): string => {
    const config = getAuthConfig()
    return jwt.sign(payload, config.refreshTokenSecret, {
        expiresIn: `${config.refreshTokenExpiryMinutes}m`
    })
}

export const verifyAccessToken = (token: string): JwtPayload => {
    const config = getAuthConfig()
    return jwt.verify(token, config.accessTokenSecret) as JwtPayload
}

export const verifyRefreshToken = (token: string): JwtPayload => {
    const config = getAuthConfig()
    return jwt.verify(token, config.refreshTokenSecret) as JwtPayload
}
