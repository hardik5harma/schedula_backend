import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookingStartEndTimeToDoctorTimeSlots1752347015143 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD COLUMN IF NOT EXISTS "booking_start_time" TIME;`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD COLUMN IF NOT EXISTS "booking_end_time" TIME;`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP COLUMN IF EXISTS "booking_start_time";`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP COLUMN IF EXISTS "booking_end_time";`);
    }
} 