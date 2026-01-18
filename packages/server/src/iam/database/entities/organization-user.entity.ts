import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IOrganizationUser } from '../../Interface.Iam'
import { Organization } from './organization.entity'
import { Role } from './role.entity'
import { User } from './user.entity'

@Entity('organization_user')
export class OrganizationUser implements IOrganizationUser {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    organizationId: string

    @Column({ type: 'text' })
    userId: string

    @Column({ nullable: true, type: 'text' })
    roleId?: string

    @Column({ type: 'boolean', default: false })
    isOwner: boolean

    @Column({ type: 'varchar', length: 32, default: 'ACTIVE' })
    status: 'PENDING' | 'ACTIVE' | 'DISABLED'

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.organizationUsers, { onDelete: 'CASCADE' })
    organization?: Organization

    @ManyToOne(() => User, (user) => user.organizationUsers, { onDelete: 'CASCADE' })
    user?: User

    @ManyToOne(() => Role, (role) => role.organizationUsers, { onDelete: 'SET NULL' })
    role?: Role
}
