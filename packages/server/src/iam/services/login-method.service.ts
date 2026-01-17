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
    async readLoginMethodByOrganizationId(_orgId: string | undefined, _queryRunner?: any): Promise<LoginMethod[]> {
        return []
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
