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

import { getRunningExpressApp } from '../../utils/getRunningExpressApp'
import { LoginMethod } from '../database/entities/login-method.entity'

export interface ILoginMethodService {
    readLoginMethodByOrganizationId(orgId: string | undefined, queryRunner?: any): Promise<LoginMethod[]>
    decryptLoginMethodConfig(config: string): Promise<string>
    listLoginMethods(organizationId?: string): Promise<LoginMethod[]>
    getLoginMethodById(loginMethodId: string): Promise<LoginMethod | null>
    createLoginMethod(payload: any): Promise<LoginMethod | null>
    updateLoginMethod(loginMethodId: string, payload: any): Promise<LoginMethod | null>
    deleteLoginMethod(loginMethodId: string): Promise<void>
}

export class LoginMethodService implements ILoginMethodService {
    async readLoginMethodByOrganizationId(orgId: string | undefined, queryRunner?: any): Promise<LoginMethod[]> {
        const execute = async (manager: any) => {
            const repository = manager.getRepository(LoginMethod)
            return repository.find({ where: orgId ? { organizationId: orgId } : { organizationId: null } })
        }
        if (queryRunner) {
            return execute(queryRunner.manager)
        }
        const appServer = getRunningExpressApp()
        return appServer.AppDataSource.transaction(async (manager) => execute(manager))
    }
    async decryptLoginMethodConfig(config: string) {
        return config
    }

    async listLoginMethods(_organizationId?: string): Promise<LoginMethod[]> {
        return []
    }

    async getLoginMethodById(_loginMethodId: string): Promise<LoginMethod | null> {
        return null
    }

    async createLoginMethod(_payload: any): Promise<LoginMethod | null> {
        return null
    }

    async updateLoginMethod(_loginMethodId: string, _payload: any): Promise<LoginMethod | null> {
        return null
    }

    async deleteLoginMethod(_loginMethodId: string): Promise<void> {
        return
    }
}
export default LoginMethodService
