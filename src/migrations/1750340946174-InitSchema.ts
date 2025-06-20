import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1750340946174 implements MigrationInterface {
    name = 'InitSchema1750340946174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user"
            ADD "hashed_refresh_token" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user" DROP COLUMN "hashed_refresh_token"
        `);
    }

}
