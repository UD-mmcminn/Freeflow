import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { ILoginMethod } from '../../Interface.Iam'
import { Organization } from './organization.entity'

export enum LoginMethodStatus {
    ENABLE = 'ENABLE',
    DISABLE = 'DISABLE'
}

@Entity('login_method')
export class LoginMethod implements ILoginMethod {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    name: string

    @Column({ type: 'varchar', length: 20, default: LoginMethodStatus.DISABLE })
    status: LoginMethodStatus

    @Column({ type: 'text', default: '{}' })
    config: string

    @Column({ nullable: true, type: 'text' })
    organizationId?: string

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @ManyToOne(() => Organization, (organization) => organization.loginMethods, { onDelete: 'CASCADE' })
    organization?: Organization
}
