export interface ILoginSessionService {
    listSessions(userId?: string): Promise<any[]>
    getSessionById(sessionId: string): Promise<any | null>
    createSession(payload: any): Promise<any>
    revokeSession(sessionId: string): Promise<void>
}

export class LoginSessionService implements ILoginSessionService {
    async listSessions(_userId?: string): Promise<any[]> {
        return []
    }

    async getSessionById(_sessionId: string): Promise<any | null> {
        return null
    }

    async createSession(_payload: any): Promise<any> {
        return null
    }

    async revokeSession(_sessionId: string): Promise<void> {
        return
    }
}
export default LoginSessionService
