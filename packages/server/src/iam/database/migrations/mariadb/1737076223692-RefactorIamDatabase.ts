import { MigrationInterface, QueryRunner } from 'typeorm'

export class RefactorIamDatabase1737076223692 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`user\` (
                \`id\` CHAR(36) NOT NULL,
                \`email\` VARCHAR(255) NOT NULL,
                \`firstName\` TEXT NULL,
                \`lastName\` TEXT NULL,
                \`credential\` TEXT NULL,
                \`tempToken\` TEXT NULL,
                \`tokenExpiry\` BIGINT NULL,
                \`isActive\` BOOLEAN NOT NULL DEFAULT TRUE,
                \`emailVerified\` BOOLEAN NOT NULL DEFAULT FALSE,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`),
                UNIQUE KEY \`IDX_user_email\` (\`email\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`organization\` (
                \`id\` CHAR(36) NOT NULL,
                \`name\` TEXT NOT NULL,
                \`subscriptionId\` TEXT NULL,
                \`customerId\` TEXT NULL,
                \`productId\` TEXT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`workspace\` (
                \`id\` CHAR(36) NOT NULL,
                \`name\` TEXT NOT NULL,
                \`organizationId\` TEXT NOT NULL,
                \`isPersonal\` BOOLEAN NOT NULL DEFAULT FALSE,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`role\` (
                \`id\` CHAR(36) NOT NULL,
                \`name\` TEXT NOT NULL,
                \`permissions\` TEXT NOT NULL DEFAULT '[]',
                \`scope\` TEXT NOT NULL DEFAULT 'organization',
                \`organizationId\` TEXT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`organization_user\` (
                \`id\` CHAR(36) NOT NULL,
                \`organizationId\` TEXT NOT NULL,
                \`userId\` TEXT NOT NULL,
                \`roleId\` TEXT NULL,
                \`isOwner\` BOOLEAN NOT NULL DEFAULT FALSE,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`workspace_user\` (
                \`id\` CHAR(36) NOT NULL,
                \`workspaceId\` TEXT NOT NULL,
                \`userId\` TEXT NOT NULL,
                \`roleId\` TEXT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`login_method\` (
                \`id\` CHAR(36) NOT NULL,
                \`name\` TEXT NOT NULL,
                \`status\` VARCHAR(20) NOT NULL DEFAULT 'DISABLE',
                \`config\` TEXT NOT NULL DEFAULT '{}',
                \`organizationId\` TEXT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`login_session\` (
                \`id\` CHAR(36) NOT NULL,
                \`userId\` TEXT NOT NULL,
                \`sessionToken\` TEXT NOT NULL,
                \`refreshToken\` TEXT NULL,
                \`expiresAt\` TIMESTAMP NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`user_credential\` (
                \`id\` CHAR(36) NOT NULL,
                \`userId\` TEXT NOT NULL,
                \`provider\` TEXT NOT NULL,
                \`passwordHash\` TEXT NULL,
                \`tempToken\` TEXT NULL,
                \`tokenExpiry\` BIGINT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`login_activity\` (
                \`id\` CHAR(36) NOT NULL,
                \`userId\` TEXT NOT NULL,
                \`organizationId\` TEXT NULL,
                \`workspaceId\` TEXT NULL,
                \`authStrategy\` TEXT NULL,
                \`status\` TEXT NULL,
                \`ipAddress\` TEXT NULL,
                \`userAgent\` TEXT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS \`workspace_shared\` (
                \`id\` CHAR(36) NOT NULL,
                \`workspaceId\` TEXT NOT NULL,
                \`sharedItemId\` TEXT NOT NULL,
                \`itemType\` TEXT NOT NULL,
                \`createdByUserId\` TEXT NULL,
                \`createdDate\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (\`id\`)
            );
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS `workspace_shared`;')
        await queryRunner.query('DROP TABLE IF EXISTS `login_activity`;')
        await queryRunner.query('DROP TABLE IF EXISTS `login_session`;')
        await queryRunner.query('DROP TABLE IF EXISTS `user_credential`;')
        await queryRunner.query('DROP TABLE IF EXISTS `login_method`;')
        await queryRunner.query('DROP TABLE IF EXISTS `workspace_user`;')
        await queryRunner.query('DROP TABLE IF EXISTS `organization_user`;')
        await queryRunner.query('DROP TABLE IF EXISTS `role`;')
        await queryRunner.query('DROP TABLE IF EXISTS `workspace`;')
        await queryRunner.query('DROP TABLE IF EXISTS `organization`;')
        await queryRunner.query('DROP TABLE IF EXISTS `user`;')
    }
}
