import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "clinic_services" })
export class ClinicServiceEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({
    type: "uuid",
    name: "clinic_id",
  })
  clinicId!: string;

  @Column({
    type: "varchar",
    length: 160,
    name: "service_name",
  })
  serviceName!: string;

  @Column({
    type: "varchar",
    length: 20,
    name: "availability_status",
  })
  availabilityStatus!: string;
}