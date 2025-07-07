import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddDoctorTimeSlotIdToAppointment1752047015146 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('appointment');
    if (table && !table.findColumnByName('doctorTimeSlotId')) {
      await queryRunner.addColumn('appointment', new TableColumn({
        name: 'doctorTimeSlotId',
        type: 'int',
        isNullable: true,
      }));
      await queryRunner.createForeignKey('appointment', new TableForeignKey({
        columnNames: ['doctorTimeSlotId'],
        referencedTableName: 'doctor_time_slots',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }));
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('appointment');
    if (table && table.findColumnByName('doctorTimeSlotId')) {
      const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf('doctorTimeSlotId') !== -1);
      if (foreignKey) {
        await queryRunner.dropForeignKey('appointment', foreignKey);
      }
      await queryRunner.dropColumn('appointment', 'doctorTimeSlotId');
    }
  }
} 