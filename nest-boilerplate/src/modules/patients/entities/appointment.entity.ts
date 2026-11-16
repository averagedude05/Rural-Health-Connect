import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("appointments")
export class AppointmentEntity {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({ name: "patient_id", type: "uuid" })
  patientId!: string;

  @Column({ name: "doctor_id", type: "uuid" })
  doctorId!: string;

  @Column({ name: "clinic_id", type: "uuid" })
  clinicId!: string;

  @Column({ name: "appointment_type", type: "varchar", length: 20 })
  appointmentType!: string;

  @Column({ name: "appointment_time", type: "timestamp" })
  appointmentTime!: Date;

  @Column({ name: "status", type: "varchar", length: 20 })
  status!: string;
}