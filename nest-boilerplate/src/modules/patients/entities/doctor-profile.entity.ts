import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "doctor_profiles" })
export class DoctorProfileEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({
    type: "uuid",
    name: "user_id",
    unique: true,
  })
  userId!: string;

  @Column({
    type: "uuid",
    name: "clinic_id",
  })
  clinicId!: string;

  @Column({
    type: "varchar",
    length: 120,
    name: "name",
  })
  name!: string;

  @Column({
    type: "varchar",
    length: 100,
    name: "specialization",
  })
  specialization!: string;
}