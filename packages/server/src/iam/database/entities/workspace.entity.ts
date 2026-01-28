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
import { IWorkspace } from '../../Interface.Iam'
import { Organization } from './organization.entity'
import { WorkspaceShared } from './workspace-shared.entity'
import { WorkspaceUser } from './workspace-user.entity'

@Entity('workspace')
export class Workspace implements IWorkspace {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    name: string

    @Column({ nullable: false, type: 'text' })
    organizationId: string

    @Column({ type: 'boolean', default: false })
    isPersonal: boolean

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.workspaces, { onDelete: 'CASCADE' })
    organization?: Organization

    @OneToMany(() => WorkspaceUser, (workspaceUser) => workspaceUser.workspace)
    workspaceUsers?: WorkspaceUser[]

    @OneToMany(() => WorkspaceShared, (workspaceShared) => workspaceShared.workspace)
    sharedItems?: WorkspaceShared[]
}
