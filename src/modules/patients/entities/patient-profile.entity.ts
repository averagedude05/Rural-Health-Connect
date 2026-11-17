import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "@/src/modules/users/entities/user.entity";

@Entity({ name: "patient_profiles" })
export class PatientProfile {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ type: "uuid", name: "user_id", unique: true })
  userId!: string;

  @OneToOne(() => User, (user) => user.patientProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "varchar", length: 160, name: "name" })
  name!: string;

  @Column({ type: "date", name: "date_of_birth", nullable: true })
  dateOfBirth!: string | null;

  @Column({ type: "text", name: "address", nullable: true })
  address!: string | null;

  @Column({ type: "varchar", length: 120, name: "emergency_contact", nullable: true })
  emergencyContact!: string | null;
}
