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

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @ManyToOne(() => Workspace, (workspace) => workspace.workspaceUsers, { onDelete: 'CASCADE' })
    workspace?: Workspace

    @ManyToOne(() => User, (user) => user.workspaceUsers, { onDelete: 'CASCADE' })
    user?: User

    @ManyToOne(() => Role, (role) => role.workspaceUsers, { onDelete: 'SET NULL' })
    role?: Role
}
