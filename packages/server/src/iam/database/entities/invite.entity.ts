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
import { IInvite } from '../../Interface.Iam'
import { Organization } from './organization.entity'
import { Role } from './role.entity'
import { Workspace } from './workspace.entity'

@Entity('invite')
export class Invite implements IInvite {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    email: string

    @Column({ nullable: true, type: 'text' })
    organizationId?: string

    @Column({ nullable: true, type: 'text' })
    workspaceId?: string

    @Column({ nullable: true, type: 'text' })
    roleId?: string

    @Column({ type: 'text' })
    token: string

    @Column({ nullable: true })
    expiresAt?: Date

    @Column({ nullable: true })
    acceptedAt?: Date

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => Organization, { onDelete: 'SET NULL' })
    organization?: Organization

    @ManyToOne(() => Workspace, { onDelete: 'SET NULL' })
    workspace?: Workspace

    @ManyToOne(() => Role, { onDelete: 'SET NULL' })
    role?: Role
}
