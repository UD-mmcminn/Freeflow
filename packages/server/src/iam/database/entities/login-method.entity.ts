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
import { ILoginMethod } from '../../Interface.Iam'
import { Organization } from './organization.entity'

export enum LoginMethodStatus {
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE'
}

@Entity('login_method')
export class LoginMethod implements ILoginMethod {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    name: string

    @Column({ type: 'varchar', length: 20, default: LoginMethodStatus.DISABLE })
    status: LoginMethodStatus

    @Column({ type: 'text', default: '{}' })
    config: string

    @Column({ nullable: true, type: 'text' })
    organizationId?: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.loginMethods, { onDelete: 'CASCADE' })
    organization?: Organization
}
