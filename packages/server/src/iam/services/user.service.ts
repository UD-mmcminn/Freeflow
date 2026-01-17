export interface IUserService {
    listUsers(): Promise<any[]>
    getUserById(userId: string): Promise<any | null>
    createUser(payload: any): Promise<any>
    updateUser(userId: string, payload: any): Promise<any>
    deleteUser(userId: string): Promise<void>
}

export class UserService implements IUserService {
    async listUsers(): Promise<any[]> {
        return []
    }

    async getUserById(_userId: string): Promise<any | null> {
        return null
    }

    async createUser(_payload: any): Promise<any> {
        return null
    }

    async updateUser(_userId: string, _payload: any): Promise<any> {
        return null
    }

    async deleteUser(_userId: string): Promise<void> {
        return
    }
}
export default UserService
