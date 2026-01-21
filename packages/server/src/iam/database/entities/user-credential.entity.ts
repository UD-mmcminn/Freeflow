import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'
import { IUserCredential } from '../../Interface.Iam'
import { User } from './user.entity'

@Entity('user_credential')
export class UserCredential implements IUserCredential {
    [key: string]: any

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ type: 'text' })
    userId: string

    @Column({ type: 'text' })
    provider: string

    @Column({ nullable: true, type: 'text' })
    passwordHash?: string

    @Column({ nullable: true, type: 'text' })
    tempToken?: string

    @Column({ nullable: true, type: 'bigint' })
    tokenExpiry?: number

    @CreateDateColumn()
    createdDate: Date

    @UpdateDateColumn()
    updatedDate: Date

    @ManyToOne(() => User, (user) => user.credentials, { onDelete: 'CASCADE' })
    user?: User
}
