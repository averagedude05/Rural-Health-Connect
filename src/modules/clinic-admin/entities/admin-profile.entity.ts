import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { User } from "@/src/modules/users/entities/user.entity";

@Entity({ name: "admin_profiles" })
export class AdminProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToOne(() => User, (user) => user.adminProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @RelationId((adminProfile: AdminProfile) => adminProfile.user)
  userId!: string;

  @Column({ type: "varchar", length: 160 })
  name!: string;
}
