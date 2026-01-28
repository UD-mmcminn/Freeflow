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
