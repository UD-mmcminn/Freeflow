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

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IUserCredential } from '../../Interface.Iam'
import { User } from './user.entity'

@Entity('user_credential')
export class UserCredential implements IUserCredential {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    userId: string

    @Column({ type: 'text' })
    provider: string

    @Column({ nullable: true, type: 'text' })
    passwordHash?: string

    @Column({ nullable: true, type: 'text' })
    tempToken?: string

    @Column({ nullable: true, type: 'bigint' })
    tokenExpiry?: number

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => User, (user) => user.credentials, { onDelete: 'CASCADE' })
    user?: User
}
