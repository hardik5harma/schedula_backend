import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddReportingTimeColumnToAppointment1752047015145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('appointment');
    if (table && !table.findColumnByName('reporting_time')) {
      await queryRunner.addColumn('appointment', new TableColumn({
        name: 'reporting_time',
        type: 'time',
        isNullable: true,
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('appointment');
    if (table && table.findColumnByName('reporting_time')) {
      await queryRunner.dropColumn('appointment', 'reporting_time');
    }
  }
} 