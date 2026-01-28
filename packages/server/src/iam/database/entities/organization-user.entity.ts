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
import { IOrganizationUser } from '../../Interface.Iam'
import { Organization } from './organization.entity'
import { Role } from './role.entity'
import { User } from './user.entity'

@Entity('organization_user')
export class OrganizationUser implements IOrganizationUser {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    organizationId: string

    @Column({ type: 'text' })
    userId: string

    @Column({ nullable: true, type: 'text' })
    roleId?: string

    @Column({ type: 'boolean', default: false })
    isOwner: boolean

    @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
    status: 'PENDING' | 'ACTIVE' | 'DISABLED'

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.organizationUsers, { onDelete: 'CASCADE' })
    organization?: Organization

    @ManyToOne(() => User, (user) => user.organizationUsers, { onDelete: 'CASCADE' })
    user?: User

    @ManyToOne(() => Role, (role) => role.organizationUsers, { onDelete: 'SET NULL' })
    role?: Role
}
