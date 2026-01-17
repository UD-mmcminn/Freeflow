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

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @ManyToOne(() => Workspace, (workspace) => workspace.sharedItems, { onDelete: 'CASCADE' })
    workspace?: Workspace

    @ManyToOne(() => User, { onDelete: 'SET NULL' })
    createdBy?: User
}
