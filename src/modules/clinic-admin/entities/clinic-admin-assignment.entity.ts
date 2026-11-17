import { CreateDateColumn, Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: "clinic_admin_assignments" })
@Index("UQ_clinic_admin_assignments_user_clinic", ["userId", "clinicId"], { unique: true })
export class ClinicAdminAssignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;
}
