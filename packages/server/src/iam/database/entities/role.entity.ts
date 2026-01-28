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

import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IRole, RoleScope } from '../../Interface.Iam'
import { Organization } from './organization.entity'
import { OrganizationUser } from './organization-user.entity'
import { WorkspaceUser } from './workspace-user.entity'

@Entity('role')
export class Role implements IRole {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    name: string

    @Column({ nullable: true, type: 'text' })
    description?: string

    @Column({ type: 'text', default: '[]' })
    permissions: string

    @Column({ type: 'text', default: 'organization' })
    scope: RoleScope

    @Column({ nullable: true, type: 'text' })
    organizationId?: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.roles, { onDelete: 'CASCADE' })
    organization?: Organization

    @OneToMany(() => OrganizationUser, (organizationUser) => organizationUser.role)
    organizationUsers?: OrganizationUser[]

    @OneToMany(() => WorkspaceUser, (workspaceUser) => workspaceUser.role)
    workspaceUsers?: WorkspaceUser[]
}
