import { LoginMethod } from '../database/entities/login-method.entity'

export class LoginMethodService {
    async readLoginMethodByOrganizationId(_orgId: string | undefined, _queryRunner?: any): Promise<LoginMethod[]> {
        return []
    }
    async decryptLoginMethodConfig(config: string) {
        return config
    }
}
export default LoginMethodService
