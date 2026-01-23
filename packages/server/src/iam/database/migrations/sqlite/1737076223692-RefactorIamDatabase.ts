import { MigrationInterface, QueryRunner } from 'typeorm'

export class RefactorIamDatabase1737076223692 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "firstName" TEXT NULL,
                "lastName" TEXT NULL,
                "credential" TEXT NULL,
                "tempToken" TEXT NULL,
                "tokenExpiry" INTEGER NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_email" ON "user" ("email");`)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organization" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "subscriptionId" TEXT NULL,
                "customerId" TEXT NULL,
                "productId" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "organizationId" TEXT NOT NULL,
                "isPersonal" INTEGER NOT NULL DEFAULT 0,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "role" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "description" TEXT NULL,
                "permissions" TEXT NOT NULL DEFAULT '[]',
                "scope" TEXT NOT NULL DEFAULT 'organization',
                "organizationId" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organization_user" (
                "id" TEXT NOT NULL,
                "organizationId" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "roleId" TEXT NULL,
                "isOwner" INTEGER NOT NULL DEFAULT 0,
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace_user" (
                "id" TEXT NOT NULL,
                "workspaceId" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "roleId" TEXT NULL,
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_method" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'DISABLE',
                "config" TEXT NOT NULL DEFAULT '{}',
                "organizationId" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_session" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "sessionToken" TEXT NOT NULL,
                "refreshToken" TEXT NULL,
                "expiresAt" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_credential" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "provider" TEXT NOT NULL,
                "passwordHash" TEXT NULL,
                "tempToken" TEXT NULL,
                "tokenExpiry" INTEGER NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "invite" (
                "id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "organizationId" TEXT NULL,
                "workspaceId" TEXT NULL,
                "roleId" TEXT NULL,
                "token" TEXT NOT NULL,
                "expiresAt" TEXT NULL,
                "acceptedAt" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_activity" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "organizationId" TEXT NULL,
                "workspaceId" TEXT NULL,
                "authStrategy" TEXT NULL,
                "status" TEXT NULL,
                "ipAddress" TEXT NULL,
                "userAgent" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace_shared" (
                "id" TEXT NOT NULL,
                "workspaceId" TEXT NOT NULL,
                "sharedItemId" TEXT NOT NULL,
                "itemType" TEXT NOT NULL,
                "createdByUserId" TEXT NULL,
                "createdDate" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY ("id")
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "workspace_shared";')
        await queryRunner.query('DROP TABLE IF EXISTS "login_activity";')
        await queryRunner.query('DROP TABLE IF EXISTS "login_session";')
        await queryRunner.query('DROP TABLE IF EXISTS "user_credential";')
        await queryRunner.query('DROP TABLE IF EXISTS "invite";')
        await queryRunner.query('DROP TABLE IF EXISTS "login_method";')
        await queryRunner.query('DROP TABLE IF EXISTS "workspace_user";')
        await queryRunner.query('DROP TABLE IF EXISTS "organization_user";')
        await queryRunner.query('DROP TABLE IF EXISTS "role";')
        await queryRunner.query('DROP TABLE IF EXISTS "workspace";')
        await queryRunner.query('DROP TABLE IF EXISTS "organization";')
        await queryRunner.query('DROP TABLE IF EXISTS "user";')
    }
}
