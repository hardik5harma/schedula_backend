import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlotDurationToDoctor1752147015143 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ADD COLUMN IF NOT EXISTS "slot_duration" integer;`);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN IF EXISTS "slot_duration";`);
    }
} 