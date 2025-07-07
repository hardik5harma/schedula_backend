import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSessionColumnToAppointment1752047015144 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('appointment');
    if (table && !table.findColumnByName('session')) {
      await queryRunner.addColumn('appointment', new TableColumn({
        name: 'session',
        type: 'varchar',
        isNullable: true,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('appointment');
    if (table && table.findColumnByName('session')) {
      await queryRunner.dropColumn('appointment', 'session');
    }
  }
} 