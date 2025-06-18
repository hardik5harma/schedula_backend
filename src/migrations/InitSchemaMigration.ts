import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuthFieldsToDoctor1680000000000 implements MigrationInterface {
    name = 'AddAuthFieldsToDoctor1680000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "hashed_refresh_token" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "hashed_refresh_token"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "password"`);
    }
} 