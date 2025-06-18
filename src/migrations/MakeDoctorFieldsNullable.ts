import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeDoctorFieldsNullable1687000000000 implements MigrationInterface {
    name = 'MakeDoctorFieldsNullable1687000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "experience_years" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "education" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "clinic_name" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "available_days" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "available_time_slots" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "experience_years" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "education" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "clinic_name" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "available_days" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "available_time_slots" SET NOT NULL`);
    }
}