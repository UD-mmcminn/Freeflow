import { MigrationInterface, QueryRunner } from 'typeorm'

const getDefaultWorkspaceId = async (queryRunner: QueryRunner): Promise<string | null> => {
    const workspaceTable = await queryRunner.getTable('workspace')
    if (!workspaceTable) return null
    const rows = await queryRunner.query(`SELECT "id" FROM "workspace" ORDER BY "createdDate" LIMIT 1;`)
    return rows?.[0]?.id ?? null
}

export class AddWorkspaceIdToCustomTemplate1726655750383 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('custom_template')
        if (!table) return
        if (!table.columns.some((column) => column.name === 'workspaceId')) {
            await queryRunner.query(`ALTER TABLE "custom_template" ADD COLUMN "workspaceId" TEXT;`)
        }
        const indexName = 'IDX_custom_template_workspaceId'
        if (!table.indices.some((index) => index.name === indexName)) {
            await queryRunner.query(`CREATE INDEX "${indexName}" ON "custom_template" ("workspaceId");`)
        }
        const defaultWorkspaceId = await getDefaultWorkspaceId(queryRunner)
        if (defaultWorkspaceId) {
            await queryRunner.query(
                `UPDATE "custom_template" SET "workspaceId" = '${defaultWorkspaceId}' WHERE "workspaceId" IS NULL;`
            )
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        return
    }
}
