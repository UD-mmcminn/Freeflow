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
