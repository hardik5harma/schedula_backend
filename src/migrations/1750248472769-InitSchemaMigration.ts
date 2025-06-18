import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemaMigration1750248472769 implements MigrationInterface {
    name = 'InitSchemaMigration1750248472769'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time_slot" ("slot_id" SERIAL NOT NULL, "day_of_week" character varying NOT NULL, "start_time" character varying NOT NULL, "end_time" character varying NOT NULL, "doctorDoctorId" integer, CONSTRAINT "PK_bfc3df46b6c1e3880a06ec3ada6" PRIMARY KEY ("slot_id"))`);
        await queryRunner.query(`CREATE TABLE "patient" ("patient_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "gender" character varying NOT NULL, "dob" date NOT NULL, "address" character varying NOT NULL, "emergency_contact" character varying NOT NULL, "medical_history" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2c56e61f9e1afb07f28882fcebb" UNIQUE ("email"), CONSTRAINT "PK_bd1c8f471a2198c19f43987ab05" PRIMARY KEY ("patient_id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("appointment_id" SERIAL NOT NULL, "appointment_date" date NOT NULL, "appointment_status" character varying NOT NULL, "reason" text NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctorDoctorId" integer, "patientPatientId" integer, "timeSlotSlotId" integer, CONSTRAINT "PK_ee9f73735a635356d4da9bd3e69" PRIMARY KEY ("appointment_id"))`);
        await queryRunner.query(`CREATE TABLE "doctor" ("doctor_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "specialization" character varying NOT NULL, "experience_years" integer NOT NULL, "education" character varying NOT NULL, "clinic_name" character varying NOT NULL, "available_days" text NOT NULL, "available_time_slots" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bf6303ac911efaab681dc911f54" UNIQUE ("email"), CONSTRAINT "PK_e2959c517497025482609c0166c" PRIMARY KEY ("doctor_id"))`);
        await queryRunner.query(`ALTER TABLE "time_slot" ADD CONSTRAINT "FK_3d3f2eb0221fbbb90fcd38fb864" FOREIGN KEY ("doctorDoctorId") REFERENCES "doctor"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_13a204ffe250d1ed48e4c864850" FOREIGN KEY ("doctorDoctorId") REFERENCES "doctor"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2fb16d91a58e4f16b4a71ed33dc" FOREIGN KEY ("patientPatientId") REFERENCES "patient"("patient_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_3467f1cadb6225a9b82a38b4950" FOREIGN KEY ("timeSlotSlotId") REFERENCES "time_slot"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_3467f1cadb6225a9b82a38b4950"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2fb16d91a58e4f16b4a71ed33dc"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_13a204ffe250d1ed48e4c864850"`);
        await queryRunner.query(`ALTER TABLE "time_slot" DROP CONSTRAINT "FK_3d3f2eb0221fbbb90fcd38fb864"`);
        await queryRunner.query(`DROP TABLE "doctor"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "patient"`);
        await queryRunner.query(`DROP TABLE "time_slot"`);
    }

}
