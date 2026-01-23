import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddRoleDescription1747000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('role')
        if (!table?.findColumnByName('description')) {
            await queryRunner.addColumn(
                'role',
                new TableColumn({
                    name: 'description',
                    type: 'text',
                    isNullable: true
                })
            )
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('role')
        if (table?.findColumnByName('description')) {
            await queryRunner.dropColumn('role', 'description')
        }
    }
}
