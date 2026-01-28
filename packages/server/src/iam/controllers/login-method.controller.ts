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

import { Request, Response } from 'express'

export interface ILoginMethodController {
    getLoginMethods(req: Request, res: Response): Promise<Response>
    updateLoginMethod(req: Request, res: Response): Promise<Response>
    createLoginMethod(req: Request, res: Response): Promise<Response>
    deleteLoginMethod(req: Request, res: Response): Promise<Response>
}

export class LoginMethodController implements ILoginMethodController {
    async getLoginMethods(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async updateLoginMethod(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async createLoginMethod(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }

    async deleteLoginMethod(_req: Request, res: Response): Promise<Response> {
        return res.status(501).json({ message: 'Not implemented' })
    }
}

export default LoginMethodController
