import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IOrganization } from '../../Interface.Iam'
import { LoginMethod } from './login-method.entity'
import { OrganizationUser } from './organization-user.entity'
import { Role } from './role.entity'
import { Workspace } from './workspace.entity'

@Entity('organization')
export class Organization implements IOrganization {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    name: string

    @Column({ nullable: true, type: 'text' })
    subscriptionId?: string

    @Column({ nullable: true, type: 'text' })
    customerId?: string

    @Column({ nullable: true, type: 'text' })
    productId?: string

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @OneToMany(() => Workspace, (workspace) => workspace.organization)
    workspaces?: Workspace[]

    @OneToMany(() => OrganizationUser, (organizationUser) => organizationUser.organization)
    organizationUsers?: OrganizationUser[]

    @OneToMany(() => Role, (role) => role.organization)
    roles?: Role[]

    @OneToMany(() => LoginMethod, (loginMethod) => loginMethod.organization)
    loginMethods?: LoginMethod[]
}
