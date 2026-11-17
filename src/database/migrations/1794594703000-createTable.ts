import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class CreateRuralHealthConnectTables1794594703000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "role", type: "varchar", length: "30", isNullable: false },
          { name: "phone", type: "varchar", length: "20", isNullable: false },
          {
            name: "password_hash",
            type: "varchar",
            length: "255",
            isNullable: false,
          },
          {
            name: "account_status",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            isNullable: false,
            default: "now()",
          },
        ],
        uniques: [
          new TableUnique({ name: "UQ_users_phone", columnNames: ["phone"] }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "admin_profiles",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
           type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          { name: "name", type: "varchar", length: "160", isNullable: false },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_admin_profiles_user_id",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "patient_profiles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
           type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          { name: "name", type: "varchar", length: "160", isNullable: false },
          { name: "date_of_birth", type: "date", isNullable: true },
          { name: "address", type: "text", isNullable: true },
          {
            name: "emergency_contact",
            type: "varchar",
            length: "120",
            isNullable: true,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_patient_profiles_user_id",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "clinics",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "name", type: "varchar", length: "160", isNullable: false },
          { name: "address", type: "text", isNullable: false },
          {
            name: "location",
            type: "varchar",
            length: "160",
            isNullable: true,
          },
          {
            name: "contact_number",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          { name: "description", type: "text", isNullable: true },
          { name: "status", type: "varchar", length: "20", isNullable: false },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "clinic_services",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "clinic_id",type: "uuid", isNullable: false },
          {
            name: "service_name",
            type: "varchar",
            length: "160",
            isNullable: false,
          },
          {
            name: "availability_status",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_clinic_services_clinic_id",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "doctor_profiles",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
           type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          { name: "clinic_id",type: "uuid", isNullable: false },
          { name: "name", type: "varchar", length: "120", isNullable: false },
          {
            name: "specialization",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_doctor_profiles_user_id",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            name: "FK_doctor_profiles_clinic_id",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "lab_technician_profiles",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "user_id",
            type: "uuid",
            isNullable: false,
            isUnique: true,
          },
          { name: "clinic_id", type: "uuid", isNullable: false },
          { name: "name", type: "varchar", length: "160", isNullable: false },
          { name: "email", type: "varchar", length: "160", isNullable: false },
          { name: "age", type: "int", isNullable: false },
          { name: "phone", type: "varchar", length: "11", isNullable: false },
          { name: "address", type: "text", isNullable: true },
        ],
        uniques: [
          new TableUnique({ name: "UQ_lab_technician_profiles_email", columnNames: ["email"] }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_lab_technician_profiles_user_id",
            columnNames: ["user_id"],
            referencedTableName: "users",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            name: "FK_lab_technician_profiles_clinic_id",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: "doctor_availabilities",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "doctor_id",type: "uuid", isNullable: false },
          { name: "available_date", type: "date", isNullable: false },
          { name: "start_time", type: "time", isNullable: false },
          { name: "end_time", type: "time", isNullable: false },
          {
            name: "slot_status",
            type: "enum",
            enum: ["AVAILABLE", "TAKEN", "UNAVAILABLE"],
            enumName: "doctor_availability_status_enum",
            default: "'AVAILABLE'",
          },
        ],
        uniques: [
          new TableUnique({
            name: "UQ_doctor_availabilities_slot",
            columnNames: ["doctor_id", "available_date", "start_time"],
          }),
        ],
        checks: [
          new TableCheck({
            name: "CHK_doctor_availabilities_time",
            expression: '"start_time" < "end_time"',
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_doctor_availabilities_doctor_id",
            columnNames: ["doctor_id"],
            referencedTableName: "doctor_profiles",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "appointments",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
           default: "uuid_generate_v4()",
          },
          { name: "patient_id",type: "uuid", isNullable: false },
          { name: "doctor_id",type: "uuid", isNullable: false },
          { name: "clinic_id",type: "uuid", isNullable: false },
          {
            name: "appointment_type",
            type: "varchar",
            length: "20",
            isNullable: false,
          },
          { name: "appointment_time", type: "timestamp", isNullable: false },
          { name: "status", type: "varchar", length: "20", isNullable: false },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_appointments_patient_id",
            columnNames: ["patient_id"],
            referencedTableName: "patient_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_appointments_doctor_id",
            columnNames: ["doctor_id"],
            referencedTableName: "doctor_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_appointments_clinic_id",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "medical_records",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          { name: "patient_id",type: "uuid", isNullable: false },
          { name: "doctor_id",type: "uuid", isNullable: false },
          { name: "clinic_id",type: "uuid", isNullable: false },
          { name: "visit_date", type: "date", isNullable: false },
          { name: "notes", type: "text", isNullable: true },
          {
            name: "access_status",
            type: "enum",
            enum: ["PRIVATE", "SHARED"],
            enumName: "medical_record_access_status_enum",
            default: "'PRIVATE'",
          },
          { name: "medicine_details", type: "jsonb", isNullable: true },
          { name: "prescription_instructions", type: "text", isNullable: true },
          {
            name: "prescription_created_at",
            type: "timestamp",
            isNullable: true,
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_medical_records_patient_id",
            columnNames: ["patient_id"],
            referencedTableName: "patient_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_medical_records_doctor_id",
            columnNames: ["doctor_id"],
            referencedTableName: "doctor_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_medical_records_clinic_id",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "lab_requests",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
           default: "uuid_generate_v4()",
          },
          { name: "patient_id",type: "uuid", isNullable: false },
          { name: "doctor_id",type: "uuid", isNullable: false },
          { name: "technician_id",type: "uuid", isNullable: true },
          {
            name: "test_name",
            type: "varchar",
            length: "160",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: [
              "REQUESTED",
              "ASSIGNED",
              "IN_PROGRESS",
              "COMPLETED",
              "CANCELLED",
            ],
            enumName: "lab_request_status_enum",
            default: "'REQUESTED'",
          },
          {
            name: "requested_at",
            type: "timestamp",
            isNullable: false,
            default: "now()",
          },
          { name: "file_path", type: "text", isNullable: true },
          { name: "result_uploaded_at", type: "timestamp", isNullable: true },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_lab_requests_patient_id",
            columnNames: ["patient_id"],
            referencedTableName: "patient_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_lab_requests_doctor_id",
            columnNames: ["doctor_id"],
            referencedTableName: "doctor_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_lab_requests_technician_id",
            columnNames: ["technician_id"],
            referencedTableName: "lab_technician_profiles",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          }),
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: "emergency_requests",
        columns: [
          {
            name: "id",
           type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
           default: "uuid_generate_v4()",
          },
          { name: "patient_id",type: "uuid", isNullable: false },
          { name: "clinic_id",type: "uuid", isNullable: true },
          { name: "assigned_doctor_id",type: "uuid", isNullable: true },
          { name: "description", type: "text", isNullable: false },
          {
            name: "priority",
            type: "enum",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            enumName: "emergency_priority_enum",
            default: "'MEDIUM'",
          },
          {
            name: "status",
            type: "enum",
            enum: ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CANCELLED"],
            enumName: "emergency_status_enum",
            default: "'OPEN'",
          },
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_emergency_requests_patient_id",
            columnNames: ["patient_id"],
            referencedTableName: "patient_profiles",
            referencedColumnNames: ["id"],
            onDelete: "RESTRICT",
          }),
          new TableForeignKey({
            name: "FK_emergency_requests_clinic_id",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          }),
          new TableForeignKey({
            name: "FK_emergency_requests_doctor_id",
            columnNames: ["assigned_doctor_id"],
            referencedTableName: "doctor_profiles",
            referencedColumnNames: ["id"],
            onDelete: "SET NULL",
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("emergency_requests");
    await queryRunner.dropTable("lab_requests");
    await queryRunner.dropTable("medical_records");
    await queryRunner.dropTable("appointments");
    await queryRunner.dropTable("doctor_availabilities");
    await queryRunner.dropTable("lab_technician_profiles");
    await queryRunner.dropTable("doctor_profiles");
    await queryRunner.dropTable("clinic_services");
    await queryRunner.dropTable("patient_profiles");
    await queryRunner.dropTable("admin_profiles");
    await queryRunner.dropTable("clinics");
    await queryRunner.dropTable("users");
  }
}
