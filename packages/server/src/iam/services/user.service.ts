export class UserService {
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
