import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddClinicIdToAdminProfiles1794845149097000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "admin_profiles",
      new TableColumn({
        name: "clinic_id",
        type: "uuid",
        isNullable: false,
      }),
    );

    await queryRunner.createForeignKey(
      "admin_profiles",
      new TableForeignKey({
        name: "FK_admin_profiles_clinic_id",
        columnNames: ["clinic_id"],
        referencedTableName: "clinics",
        referencedColumnNames: ["id"],
        onDelete: "RESTRICT",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      "admin_profiles",
      "FK_admin_profiles_clinic_id",
    );
    await queryRunner.dropColumn("admin_profiles", "clinic_id");
  }
}