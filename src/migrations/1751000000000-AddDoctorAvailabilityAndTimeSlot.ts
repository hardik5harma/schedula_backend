import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDoctorAvailabilityAndTimeSlot1751000000000 implements MigrationInterface {
    name = 'AddDoctorAvailabilityAndTimeSlot1751000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "doctor_availabilities" (
                "id" SERIAL PRIMARY KEY,
                "doctorId" integer NOT NULL,
                "date" date NOT NULL,
                "start_time" time NOT NULL,
                "end_time" time NOT NULL,
                "weekdays" character varying,
                "session" character varying NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_doctor_availabilities_doctor" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctor_id") ON DELETE CASCADE
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "doctor_time_slots" (
                "id" SERIAL PRIMARY KEY,
                "doctorId" integer NOT NULL,
                "doctorAvailabilityId" integer NOT NULL,
                "date" date NOT NULL,
                "start_time" time NOT NULL,
                "end_time" time NOT NULL,
                "is_available" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_doctor_time_slots_doctor" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctor_id") ON DELETE CASCADE,
                CONSTRAINT "FK_doctor_time_slots_availability" FOREIGN KEY ("doctorAvailabilityId") REFERENCES "doctor_availabilities"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "doctor_time_slots"
        `);
        await queryRunner.query(`
            DROP TABLE "doctor_availabilities"
        `);
    }
} 