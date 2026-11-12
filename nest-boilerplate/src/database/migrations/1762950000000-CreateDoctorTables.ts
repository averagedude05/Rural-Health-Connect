import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorTables1762950000000 implements MigrationInterface {
  name = "CreateDoctorTables1762950000000";

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "doctor_verification_status_enum" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "doctor_availability_status_enum" AS ENUM ('AVAILABLE', 'BOOKED', 'UNAVAILABLE')`,
    );
    await queryRunner.query(`
      CREATE TABLE "doctor_profiles" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "clinic_id" integer NOT NULL,
        "full_name" character varying(120) NOT NULL,
        "specialization" character varying(100) NOT NULL,
        "qualification" character varying(200) NOT NULL,
        "verification_status" "doctor_verification_status_enum" NOT NULL DEFAULT 'PENDING',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_doctor_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_doctor_profiles_user_id" UNIQUE ("user_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "doctor_availabilities" (
        "id" SERIAL NOT NULL,
        "doctor_id" integer NOT NULL,
        "available_date" date NOT NULL,
        "start_time" time NOT NULL,
        "end_time" time NOT NULL,
        "status" "doctor_availability_status_enum" NOT NULL DEFAULT 'AVAILABLE',
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_doctor_availabilities_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_doctor_availabilities_doctor_id" FOREIGN KEY ("doctor_id") REFERENCES "doctor_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_doctor_availabilities_slot" UNIQUE ("doctor_id", "available_date", "start_time"),
        CONSTRAINT "CHK_doctor_availabilities_time" CHECK ("start_time" < "end_time")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "doctor_availabilities"`);
    await queryRunner.query(`DROP TABLE "doctor_profiles"`);
    await queryRunner.query(`DROP TYPE "doctor_availability_status_enum"`);
    await queryRunner.query(`DROP TYPE "doctor_verification_status_enum"`);
  }
}
