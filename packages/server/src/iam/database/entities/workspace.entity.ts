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

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.workspaces, { onDelete: 'CASCADE' })
    organization?: Organization

    @OneToMany(() => WorkspaceUser, (workspaceUser) => workspaceUser.workspace)
    workspaceUsers?: WorkspaceUser[]

    @OneToMany(() => WorkspaceShared, (workspaceShared) => workspaceShared.workspace)
    sharedItems?: WorkspaceShared[]
}
