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
    'evaluator',
    'custom_template',
    'execution'
]

type TableColumn = {
    name: string
    type: string
    notnull: number
    dflt_value: string | null
    pk: number
}

const quoteIdent = (value: string): string => `"${value}"`

const getTableColumns = async (queryRunner: QueryRunner, tableName: string): Promise<TableColumn[]> => {
    return queryRunner.query(`PRAGMA table_info(${quoteIdent(tableName)});`)
}

const getTableIndexes = async (queryRunner: QueryRunner, tableName: string): Promise<{ name: string; sql: string | null }[]> => {
    return queryRunner.query(
        `SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='${tableName}' AND sql IS NOT NULL;`
    )
}

const buildColumnDefinition = (column: TableColumn, inlinePrimaryKey: boolean): string => {
    const parts: string[] = [quoteIdent(column.name)]
    if (column.type) {
        parts.push(column.type)
    }
    if (column.notnull) {
        parts.push('NOT NULL')
    }
    if (column.dflt_value !== null && column.dflt_value !== undefined) {
        const defaultValue = String(column.dflt_value).trim()
        const needsParens = defaultValue.includes('(') && !(defaultValue.startsWith('(') && defaultValue.endsWith(')'))
        parts.push(`DEFAULT ${needsParens ? `(${defaultValue})` : defaultValue}`)
    }
    if (inlinePrimaryKey) {
        parts.push('PRIMARY KEY')
    }
    return parts.join(' ')
}

const rebuildTableWithWorkspaceFk = async (queryRunner: QueryRunner, tableName: string): Promise<void> => {
    const columns = await getTableColumns(queryRunner, tableName)
    if (!columns?.length) return
    const hasWorkspaceId = columns.some((column) => column.name === 'workspaceId')
    if (!hasWorkspaceId) return

    const pkColumns = columns.filter((column) => column.pk > 0).sort((a, b) => a.pk - b.pk)
    const inlinePk = pkColumns.length === 1
    const columnDefinitions = columns.map((column) => buildColumnDefinition(column, inlinePk && column.pk > 0))
    if (pkColumns.length > 1) {
        const pkList = pkColumns.map((column) => quoteIdent(column.name)).join(', ')
        columnDefinitions.push(`PRIMARY KEY (${pkList})`)
    }
    columnDefinitions.push(`FOREIGN KEY (${quoteIdent('workspaceId')}) REFERENCES "workspace"("id")`)

    const tempTableName = `${tableName}_workspace_fk`
    const indexRows = await getTableIndexes(queryRunner, tableName)

    await queryRunner.query(`CREATE TABLE ${quoteIdent(tempTableName)} (${columnDefinitions.join(', ')});`)

    const columnNames = columns.map((column) => quoteIdent(column.name)).join(', ')
    await queryRunner.query(
        `INSERT INTO ${quoteIdent(tempTableName)} (${columnNames}) SELECT ${columnNames} FROM ${quoteIdent(tableName)};`
    )

    await queryRunner.query(`DROP TABLE ${quoteIdent(tableName)};`)
    await queryRunner.query(`ALTER TABLE ${quoteIdent(tempTableName)} RENAME TO ${quoteIdent(tableName)};`)

    for (const row of indexRows) {
        if (row?.sql) {
            await queryRunner.query(row.sql)
        }
    }

    const workspaceIndexName = `IDX_${tableName}_workspaceId`
    if (!indexRows.some((row) => row.name === workspaceIndexName)) {
        await queryRunner.query(
            `CREATE INDEX ${quoteIdent(workspaceIndexName)} ON ${quoteIdent(tableName)} (${quoteIdent('workspaceId')});`
        )
    }
}

export class RebuildWorkspaceIdFks1766000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const tableName of TABLES) {
            await rebuildTableWithWorkspaceFk(queryRunner, tableName)
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        return
    }
}
