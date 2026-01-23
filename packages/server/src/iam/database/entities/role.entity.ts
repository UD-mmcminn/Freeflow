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
