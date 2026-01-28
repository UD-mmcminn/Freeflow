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
import { ILoginActivity } from '../../Interface.Iam'
import { Organization } from './organization.entity'
import { User } from './user.entity'
import { Workspace } from './workspace.entity'

@Entity('login_activity')
export class LoginActivity implements ILoginActivity {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    userId: string

    @Column({ nullable: true, type: 'text' })
    organizationId?: string

    @Column({ nullable: true, type: 'text' })
    workspaceId?: string

    @Column({ nullable: true, type: 'text' })
    authStrategy?: string

    @Column({ nullable: true, type: 'text' })
    status?: string

    @Column({ nullable: true, type: 'text' })
    ipAddress?: string

    @Column({ nullable: true, type: 'text' })
    userAgent?: string

    @CreateDateColumn()
    createdDate: Date

    @ManyToOne(() => User, (user) => user.loginActivities, { onDelete: 'CASCADE' })
    user?: User

    @ManyToOne(() => Organization, { onDelete: 'SET NULL' })
    organization?: Organization

    @ManyToOne(() => Workspace, { onDelete: 'SET NULL' })
    workspace?: Workspace
}
