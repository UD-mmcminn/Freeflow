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
