import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
  TableUnique,
} from "typeorm";

export class CreateClinicPatientConsents1795000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "medical_records",
      new TableColumn({
        name: "case_category",
        type: "varchar",
        length: "120",
        isNullable: true,
      }),
    );
    await queryRunner.createTable(
      new Table({
        name: "clinic_patient_consents",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            default: "public.uuid_generate_v4()",
          },
          { name: "patient_id", type: "uuid", isNullable: false },
          { name: "clinic_id", type: "uuid", isNullable: false },
          {
            name: "status",
            type: "varchar",
            length: "20",
            default: "'GRANTED'",
            isNullable: false,
          },
          {
            name: "granted_at",
            type: "timestamp",
            isNullable: false,
            default: "now()",
          },
          { name: "revoked_at", type: "timestamp", isNullable: true },
        ],
        uniques: [
          new TableUnique({
            name: "UQ_clinic_patient_consents_patient_clinic",
            columnNames: ["patient_id", "clinic_id"],
          }),
        ],
        foreignKeys: [
          new TableForeignKey({
            name: "FK_clinic_patient_consents_patient",
            columnNames: ["patient_id"],
            referencedTableName: "patient_profiles",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
          new TableForeignKey({
            name: "FK_clinic_patient_consents_clinic",
            columnNames: ["clinic_id"],
            referencedTableName: "clinics",
            referencedColumnNames: ["id"],
            onDelete: "CASCADE",
          }),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("clinic_patient_consents");
    await queryRunner.dropColumn("medical_records", "case_category");
  }
}
