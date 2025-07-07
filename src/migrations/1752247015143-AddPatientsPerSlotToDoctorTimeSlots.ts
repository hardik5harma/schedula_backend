import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPatientsPerSlotToDoctorTimeSlots1752247015143 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD COLUMN IF NOT EXISTS "patients_per_slot" integer NOT NULL DEFAULT 1;`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP COLUMN IF EXISTS "patients_per_slot";`);
    }
} 