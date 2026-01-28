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
import { IWorkspaceUser } from '../../Interface.Iam'
import { Role } from './role.entity'
import { User } from './user.entity'
import { Workspace } from './workspace.entity'

@Entity('workspace_user')
export class WorkspaceUser implements IWorkspaceUser {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    workspaceId: string

    @Column({ type: 'text' })
    userId: string

    @Column({ nullable: true, type: 'text' })
    roleId?: string

    @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
    status: 'PENDING' | 'ACTIVE' | 'DISABLED'

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => Workspace, (workspace) => workspace.workspaceUsers, { onDelete: 'CASCADE' })
    workspace?: Workspace

    @ManyToOne(() => User, (user) => user.workspaceUsers, { onDelete: 'CASCADE' })
    user?: User

    @ManyToOne(() => Role, (role) => role.workspaceUsers, { onDelete: 'SET NULL' })
    role?: Role
}
