import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { ILoginSession } from '../../Interface.Iam'
import { User } from './user.entity'

@Entity('login_session')
export class LoginSession implements ILoginSession {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    userId: string

    @Column({ type: 'text' })
    sessionToken: string

    @Column({ nullable: true, type: 'text' })
    refreshToken?: string

    @Column({ nullable: true, type: 'timestamp' })
    expiresAt?: Date

    @CreateDateColumn({ type: 'timestamp' })
    createdDate: Date

    @UpdateDateColumn({ type: 'timestamp' })
    updatedDate: Date

    @ManyToOne(() => User, (user) => user.loginSessions, { onDelete: 'CASCADE' })
    user?: User
}
