import { MigrationInterface, QueryRunner } from 'typeorm'

const getDefaultWorkspaceId = async (queryRunner: QueryRunner): Promise<string | null> => {
    const workspaceTable = await queryRunner.getTable('workspace')
    if (!workspaceTable) return null
    const rows = await queryRunner.query(`SELECT "id" FROM "workspace" ORDER BY "createdDate" LIMIT 1;`)
    return rows?.[0]?.id ?? null
}

export class ExecutionLinkWorkspaceId1746862866554 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('execution')
        if (!table) return
        if (!table.columns.some((column) => column.name === 'workspaceId')) {
            await queryRunner.query(`ALTER TABLE "execution" ADD COLUMN "workspaceId" TEXT;`)
        }
        const indexName = 'IDX_execution_workspaceId'
        if (!table.indices.some((index) => index.name === indexName)) {
            await queryRunner.query(`CREATE INDEX "${indexName}" ON "execution" ("workspaceId");`)
        }
        const fkName = 'FK_execution_workspaceId'
        if (!table.foreignKeys.some((fk) => fk.name === fkName)) {
            await queryRunner.query(
                `ALTER TABLE "execution" ADD CONSTRAINT "${fkName}" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id");`
            )
        }
        const defaultWorkspaceId = await getDefaultWorkspaceId(queryRunner)
        if (defaultWorkspaceId) {
            await queryRunner.query(
                `UPDATE "execution" SET "workspaceId" = '${defaultWorkspaceId}' WHERE "workspaceId" IS NULL;`
            )
        }
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        return
    }
}
