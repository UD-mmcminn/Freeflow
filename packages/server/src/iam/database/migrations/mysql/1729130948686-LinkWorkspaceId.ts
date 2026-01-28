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

const TABLES = [
    'chat_flow',
    'credential',
    'tool',
    'assistant',
    'variable',
    'document_store',
    'apikey',
    'dataset',
    'evaluation',
    'evaluator'
]

const getDefaultWorkspaceId = async (queryRunner: QueryRunner): Promise<string | null> => {
    const workspaceTable = await queryRunner.getTable('workspace')
    if (!workspaceTable) return null
    const rows = await queryRunner.query(`SELECT \`id\` FROM \`workspace\` ORDER BY \`createdDate\` LIMIT 1;`)
    return rows?.[0]?.id ?? null
}

const ensureWorkspaceIdColumn = async (queryRunner: QueryRunner, tableName: string): Promise<void> => {
    const table = await queryRunner.getTable(tableName)
    if (!table) return
    if (!table.columns.some((column) => column.name === 'workspaceId')) {
        await queryRunner.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`workspaceId\` TEXT;`)
    }
}

const ensureWorkspaceIdIndex = async (queryRunner: QueryRunner, tableName: string): Promise<void> => {
    const table = await queryRunner.getTable(tableName)
    if (!table) return
    const indexName = `IDX_${tableName}_workspaceId`
    if (!table.indices.some((index) => index.name === indexName)) {
        await queryRunner.query(`CREATE INDEX \`${indexName}\` ON \`${tableName}\` (\`workspaceId\`);`)
    }
}

const ensureWorkspaceIdForeignKey = async (queryRunner: QueryRunner, tableName: string): Promise<void> => {
    const table = await queryRunner.getTable(tableName)
    if (!table) return
    const fkName = `FK_${tableName}_workspaceId`
    if (!table.foreignKeys.some((fk) => fk.name === fkName)) {
        await queryRunner.query(
            `ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`workspaceId\`) REFERENCES \`workspace\`(\`id\`);`
        )
    }
}

const backfillWorkspaceId = async (queryRunner: QueryRunner, tableName: string, workspaceId: string | null): Promise<void> => {
    if (!workspaceId) return
    await queryRunner.query(
        `UPDATE \`${tableName}\` SET \`workspaceId\` = '${workspaceId}' WHERE \`workspaceId\` IS NULL;`
    )
}

export class LinkWorkspaceId1729130948686 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const defaultWorkspaceId = await getDefaultWorkspaceId(queryRunner)
        for (const tableName of TABLES) {
            await ensureWorkspaceIdColumn(queryRunner, tableName)
            await ensureWorkspaceIdIndex(queryRunner, tableName)
            await backfillWorkspaceId(queryRunner, tableName, defaultWorkspaceId)
            await ensureWorkspaceIdForeignKey(queryRunner, tableName)
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        return
    }
}
