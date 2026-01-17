export interface IAuthService {
    login(payload: any): Promise<any>
    logout(sessionToken: string): Promise<void>
    refreshToken(refreshToken: string): Promise<any>
    startSsoLogin(provider: string): Promise<any>
    handleSsoCallback(provider: string, payload: any): Promise<any>
    logoutSso(sessionToken: string): Promise<void>
}

export class AuthService implements IAuthService {
    async login(_payload: any): Promise<any> {
        return null
    }

    async logout(_sessionToken: string): Promise<void> {
        return
    }

    async refreshToken(_refreshToken: string): Promise<any> {
        return null
    }

    async startSsoLogin(_provider: string): Promise<any> {
        return null
    }

    async handleSsoCallback(_provider: string, _payload: any): Promise<any> {
        return null
    }

    async logoutSso(_sessionToken: string): Promise<void> {
        return
    }
}

export default AuthService
