import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "patient_profiles" })
export class PatientProfile {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({
    type: "uuid",
    name: "user_id",
    unique: true,
  })
  userId!: string;

  @Column({
    type: "varchar",
    length: 160,
    name: "name",
  })
  name!: string;

  @Column({
    type: "date",
    name: "date_of_birth",
    nullable: true,
  })
  dateOfBirth!: string | null;

  @Column({
    type: "text",
    name: "address",
    nullable: true,
  })
  address!: string | null;

  @Column({
    type: "varchar",
    length: 120,
    name: "emergency_contact",
    nullable: true,
  })
  emergencyContact!: string | null;
}