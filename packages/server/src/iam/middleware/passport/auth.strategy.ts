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

import { Request } from 'express'
import passport from 'passport'
import { Strategy as JwtStrategy } from 'passport-jwt'
import { getAuthConfig } from './auth.config'
import { JwtPayload, LoggedInUser } from '../../Interface.Iam'

const cookieExtractor = (req: Request): string | null => {
    const config = getAuthConfig()
    return (req?.cookies?.[config.cookies.accessTokenName] as string | undefined) ?? null
}

export const configureJwtStrategy = (): void => {
    const config = getAuthConfig()
    passport.use(
        'jwt',
        new JwtStrategy(
            {
                jwtFromRequest: cookieExtractor,
                secretOrKey: config.accessTokenSecret,
                passReqToCallback: true
            },
            (req: Request, payload: JwtPayload, done) => {
                try {
                    const sessionUser = req.user as LoggedInUser | undefined
                    if (!sessionUser) {
                        return done(null, false)
                    }
                    if (payload?.userId && payload.userId !== sessionUser.id) {
                        return done(null, false)
                    }
                    if (payload?.orgId && sessionUser.activeOrganizationId && payload.orgId !== sessionUser.activeOrganizationId) {
                        return done(null, false)
                    }
                    if (payload?.workspaceId && sessionUser.activeWorkspaceId && payload.workspaceId !== sessionUser.activeWorkspaceId) {
                        return done(null, false)
                    }
                    return done(null, sessionUser)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )
}
