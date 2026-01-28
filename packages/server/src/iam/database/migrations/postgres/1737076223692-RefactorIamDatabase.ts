/*
 * Copyright (c) 2026 Union Dynamic, Inc
 *
 * This source code is licensed under the "IAM Module License" (AGPLv3 + AI Clause).
 * You may not use this file except in compliance with the License.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the LICENSE file in this directory for the full license text and
 * restrictions regarding Artificial Intelligence training.
 */

import { MigrationInterface, QueryRunner } from 'typeorm'

export class RefactorIamDatabase1737076223692 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" uuid NOT NULL,
                "email" varchar(255) NOT NULL,
                "firstName" text NULL,
                "lastName" text NULL,
                "credential" text NULL,
                "tempToken" text NULL,
                "tokenExpiry" bigint NULL,
                "status" varchar(32) NOT NULL DEFAULT 'PENDING',
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_email" ON "user" ("email");`)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organization" (
                "id" uuid NOT NULL,
                "name" text NOT NULL,
                "subscriptionId" text NULL,
                "customerId" text NULL,
                "productId" text NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace" (
                "id" uuid NOT NULL,
                "name" text NOT NULL,
                "organizationId" text NOT NULL,
                "isPersonal" boolean NOT NULL DEFAULT false,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "role" (
                "id" uuid NOT NULL,
                "name" text NOT NULL,
                "description" text NULL,
                "permissions" text NOT NULL DEFAULT '[]',
                "scope" text NOT NULL DEFAULT 'organization',
                "organizationId" text NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "organization_user" (
                "id" uuid NOT NULL,
                "organizationId" text NOT NULL,
                "userId" text NOT NULL,
                "roleId" text NULL,
                "isOwner" boolean NOT NULL DEFAULT false,
                "status" varchar(32) NOT NULL DEFAULT 'ACTIVE',
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace_user" (
                "id" uuid NOT NULL,
                "workspaceId" text NOT NULL,
                "userId" text NOT NULL,
                "roleId" text NULL,
                "status" varchar(32) NOT NULL DEFAULT 'ACTIVE',
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_method" (
                "id" uuid NOT NULL,
                "name" text NOT NULL,
                "status" varchar(20) NOT NULL DEFAULT 'DISABLE',
                "config" text NOT NULL DEFAULT '{}',
                "organizationId" text NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_session" (
                "id" uuid NOT NULL,
                "userId" text NOT NULL,
                "sessionToken" text NOT NULL,
                "refreshToken" text NULL,
                "expiresAt" timestamp NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user_credential" (
                "id" uuid NOT NULL,
                "userId" text NOT NULL,
                "provider" text NOT NULL,
                "passwordHash" text NULL,
                "tempToken" text NULL,
                "tokenExpiry" bigint NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "invite" (
                "id" uuid NOT NULL,
                "email" text NOT NULL,
                "organizationId" text NULL,
                "workspaceId" text NULL,
                "roleId" text NULL,
                "token" text NOT NULL,
                "expiresAt" timestamp NULL,
                "acceptedAt" timestamp NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                "updatedDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "login_activity" (
                "id" uuid NOT NULL,
                "userId" text NOT NULL,
                "organizationId" text NULL,
                "workspaceId" text NULL,
                "authStrategy" text NULL,
                "status" text NULL,
                "ipAddress" text NULL,
                "userAgent" text NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
                PRIMARY KEY ("id")
            );
        `)

        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "workspace_shared" (
                "id" uuid NOT NULL,
                "workspaceId" text NOT NULL,
                "sharedItemId" text NOT NULL,
                "itemType" text NOT NULL,
                "createdByUserId" text NULL,
                "createdDate" timestamp NOT NULL DEFAULT now(),
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
