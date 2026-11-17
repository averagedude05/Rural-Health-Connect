
import { Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity("doctor_profiles")
@Unique(["userId"])
export class DoctorProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // These IDs connect this feature to the shared User and Clinic modules.
  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ name: "name", type: "varchar", length: 120 })
  fullName!: string;

  @Column({ type: "varchar", length: 100 })
  specialization!: string;
}
