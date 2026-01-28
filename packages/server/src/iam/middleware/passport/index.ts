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

import { Application, NextFunction, Request, Response } from 'express'
import session from 'express-session'
import fs from 'fs'
import path from 'path'
import passport from 'passport'
import { createClient } from 'redis'
import { StatusCodes } from 'http-status-codes'
import { configureJwtStrategy } from './auth.strategy'
import getAuthConfig from './auth.config'
import { getRunningExpressApp } from '../../../utils/getRunningExpressApp'
import { getUserHome } from '../../../utils'

type SessionStore = ReturnType<typeof session> extends { Store: infer StoreType } ? StoreType : any

const buildSessionStore = async (): Promise<SessionStore | undefined> => {
    const expireOnRestart = (process.env.EXPIRE_AUTH_TOKENS_ON_RESTART ?? 'true').toLowerCase() === 'true'
    if (expireOnRestart) {
        return undefined
    }

    if (process.env.REDIS_URL) {
        const redisModule = (await import('connect-redis')) as unknown as { RedisStore?: any; default?: any }
        const RedisStore = redisModule.RedisStore ?? redisModule.default
        const client = createClient({ url: process.env.REDIS_URL })
        await client.connect()
        return new RedisStore({ client })
    }

    const dbType = process.env.DATABASE_TYPE ?? 'sqlite'
    if (dbType === 'sqlite') {
        const connectSqlite3 = (await import('connect-sqlite3')).default
        const SqliteStore = connectSqlite3(session)
        const basePath = process.env.DATABASE_PATH ?? path.join(getUserHome(), '.flowise')
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true })
        }
        return new SqliteStore({
            dir: basePath,
            db: 'sessions.sqlite'
        })
    }

    return undefined
}

export const initializeJwtCookieMiddleware = async (app: Application, _identityManager?: unknown): Promise<void> => {
    const config = getAuthConfig()
    const store = await buildSessionStore()

    app.use(
        session({
            secret: config.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: config.cookies.secure,
                httpOnly: true,
                sameSite: 'lax'
            },
            store
        })
    )

    app.use(passport.initialize())
    app.use(passport.session())
    configureJwtStrategy()

    passport.serializeUser((user: any, done) => {
        done(null, user)
    })

    passport.deserializeUser((user: any, done) => {
        done(null, user)
    })

    if (store) {
        const appServer = getRunningExpressApp()
        appServer.sessionStore = store
    }
}

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
        return
    }
    passport.authenticate('jwt', { session: false }, (err: unknown, user: any) => {
        if (err || !user) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized' })
            return
        }
        req.user = user
        next()
    })(req, res, next)
}

export const verifyTokenForBullMQDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return verifyToken(req, res, next)
}
