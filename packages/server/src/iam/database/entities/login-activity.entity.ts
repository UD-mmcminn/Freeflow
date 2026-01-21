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
