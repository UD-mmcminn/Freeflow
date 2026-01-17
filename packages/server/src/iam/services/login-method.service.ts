export class LoginMethodService {
    async readLoginMethodByOrganizationId(_orgId: string | undefined, _queryRunner?: any) {
        return []
    }
    async decryptLoginMethodConfig(config: string) {
        return config
    }
}
export default LoginMethodService
