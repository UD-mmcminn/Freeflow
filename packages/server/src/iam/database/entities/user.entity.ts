import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IUser } from '../../Interface.Iam'
import { LoginActivity } from './login-activity.entity'
import { LoginSession } from './login-session.entity'
import { OrganizationUser } from './organization-user.entity'
import { UserCredential } from './user-credential.entity'
import { WorkspaceUser } from './workspace-user.entity'

@Entity('user')
export class User implements IUser {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string

    @Column({ nullable: true, type: 'text' })
    firstName?: string

    @Column({ nullable: true, type: 'text' })
    lastName?: string

    @Column({ nullable: true, type: 'text' })
    credential?: string | Promise<string>

    @Column({ nullable: true, type: 'text' })
    tempToken?: string

    @Column({ nullable: true, type: 'bigint' })
    tokenExpiry?: number

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @Column({ type: 'boolean', default: false })
    emailVerified: boolean

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @OneToMany(() => OrganizationUser, (organizationUser) => organizationUser.user)
    organizationUsers?: OrganizationUser[]

    @OneToMany(() => WorkspaceUser, (workspaceUser) => workspaceUser.user)
    workspaceUsers?: WorkspaceUser[]

    @OneToMany(() => LoginSession, (loginSession) => loginSession.user)
    loginSessions?: LoginSession[]

    @OneToMany(() => LoginActivity, (loginActivity) => loginActivity.user)
    loginActivities?: LoginActivity[]

    @OneToMany(() => UserCredential, (credential) => credential.user)
    credentials?: UserCredential[]
}
