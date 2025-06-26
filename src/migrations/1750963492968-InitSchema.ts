import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1750963492968 implements MigrationInterface {
    name = 'InitSchema1750963492968'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time_slot" ("slot_id" SERIAL NOT NULL, "day_of_week" character varying NOT NULL, "start_time" character varying NOT NULL, "end_time" character varying NOT NULL, "doctorDoctorId" integer, CONSTRAINT "PK_bfc3df46b6c1e3880a06ec3ada6" PRIMARY KEY ("slot_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('doctor', 'patient')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "name" character varying, "password" character varying, "provider" character varying NOT NULL DEFAULT 'local', "role" "public"."user_role_enum" NOT NULL, "hashed_refresh_token" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient" ("patient_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "phone_number" character varying NOT NULL, "gender" character varying NOT NULL, "dob" date NOT NULL, "address" character varying NOT NULL, "emergency_contact" character varying NOT NULL, "medical_history" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_bd1c8f471a2198c19f43987ab05" PRIMARY KEY ("patient_id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("appointment_id" SERIAL NOT NULL, "appointment_date" date NOT NULL, "appointment_status" character varying NOT NULL, "reason" text NOT NULL, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "doctorDoctorId" integer, "patientPatientId" integer, "timeSlotSlotId" integer, CONSTRAINT "PK_ee9f73735a635356d4da9bd3e69" PRIMARY KEY ("appointment_id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_time_slots" ("id" SERIAL NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "doctorId" integer, "doctorAvailabilityId" integer, CONSTRAINT "PK_63d5b22af8d0e2f639346cb7db0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_availabilities" ("id" SERIAL NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "weekdays" character varying, "session" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "doctorId" integer, CONSTRAINT "PK_2a42931ed0fe3c6934b737c503a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor" ("doctor_id" SERIAL NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "phone_number" character varying NOT NULL, "specialization" character varying NOT NULL, "experience_years" integer, "education" character varying, "clinic_name" character varying, "available_days" text, "available_time_slots" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "UQ_bf6303ac911efaab681dc911f54" UNIQUE ("email"), CONSTRAINT "PK_e2959c517497025482609c0166c" PRIMARY KEY ("doctor_id"))`);
        await queryRunner.query(`ALTER TABLE "time_slot" ADD CONSTRAINT "FK_3d3f2eb0221fbbb90fcd38fb864" FOREIGN KEY ("doctorDoctorId") REFERENCES "doctor"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_13a204ffe250d1ed48e4c864850" FOREIGN KEY ("doctorDoctorId") REFERENCES "doctor"("doctor_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2fb16d91a58e4f16b4a71ed33dc" FOREIGN KEY ("patientPatientId") REFERENCES "patient"("patient_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_3467f1cadb6225a9b82a38b4950" FOREIGN KEY ("timeSlotSlotId") REFERENCES "time_slot"("slot_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD CONSTRAINT "FK_febe26b0e8532d2376dd749fd3f" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" ADD CONSTRAINT "FK_83dafeaa9f3d1efc932c771a1b4" FOREIGN KEY ("doctorAvailabilityId") REFERENCES "doctor_availabilities"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availabilities" ADD CONSTRAINT "FK_15483e668847e9b5bf2b1ed8e26" FOREIGN KEY ("doctorId") REFERENCES "doctor"("doctor_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8"`);
        await queryRunner.query(`ALTER TABLE "doctor_availabilities" DROP CONSTRAINT "FK_15483e668847e9b5bf2b1ed8e26"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP CONSTRAINT "FK_83dafeaa9f3d1efc932c771a1b4"`);
        await queryRunner.query(`ALTER TABLE "doctor_time_slots" DROP CONSTRAINT "FK_febe26b0e8532d2376dd749fd3f"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_3467f1cadb6225a9b82a38b4950"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2fb16d91a58e4f16b4a71ed33dc"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_13a204ffe250d1ed48e4c864850"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394"`);
        await queryRunner.query(`ALTER TABLE "time_slot" DROP CONSTRAINT "FK_3d3f2eb0221fbbb90fcd38fb864"`);
        await queryRunner.query(`DROP TABLE "doctor"`);
        await queryRunner.query(`DROP TABLE "doctor_availabilities"`);
        await queryRunner.query(`DROP TABLE "doctor_time_slots"`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "patient"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "time_slot"`);
    }

}
