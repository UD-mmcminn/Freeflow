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

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { IWorkspaceShared } from '../../Interface.Iam'
import { User } from './user.entity'
import { Workspace } from './workspace.entity'

@Entity('workspace_shared')
export class WorkspaceShared implements IWorkspaceShared {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    workspaceId: string

    @Column({ type: 'text' })
    sharedItemId: string

    @Column({ type: 'text' })
    itemType: string

    @Column({ nullable: true, type: 'text' })
    createdByUserId?: string

    @CreateDateColumn()
    createdDate: Date

    @ManyToOne(() => Workspace, (workspace) => workspace.sharedItems, { onDelete: 'CASCADE' })
    workspace?: Workspace

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    createdBy?: User
}
