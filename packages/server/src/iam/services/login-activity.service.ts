export interface ILoginActivityService {
    listLoginActivity(userId?: string): Promise<any[]>
    recordLoginActivity(payload: any): Promise<any>
}

export class LoginActivityService implements ILoginActivityService {
    async listLoginActivity(_userId?: string): Promise<any[]> {
        return []
    }

    async recordLoginActivity(_payload: any): Promise<any> {
        return null
    }
}
export default LoginActivityService
