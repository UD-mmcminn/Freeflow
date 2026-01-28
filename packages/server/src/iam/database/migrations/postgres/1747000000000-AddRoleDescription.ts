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
