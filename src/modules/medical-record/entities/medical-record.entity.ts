import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { PatientProfile } from "../../patient/entities/patient.entity";
import { DoctorProfile } from "../../doctor/entities/doctor.entity";
import { Clinic } from "../../clinic/entities/clinic.entity";

@Entity("medical_records")
export class MedicalRecord {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    patient_id!: string;

    @ManyToOne(() => PatientProfile)
    @JoinColumn({ name: "patient_id" })
    patient!: PatientProfile;

    @Column()
    doctor_id!: string;

    @ManyToOne(() => DoctorProfile)
    @JoinColumn({ name: "doctor_id" })
    doctor!: DoctorProfile;

    @Column()
    clinic_id!: string;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: "clinic_id" })
    clinic!: Clinic;

    @Column()
    visit_date!: Date;

    @Column({ nullable: true })
    notes!: string;

    @Column({ type: "enum",enum: ["PRIVATE", "SHARED"],default: "PRIVATE"})
    access_status!: string;

    @Column({ nullable: true })
    medicine_details!: Record<string,string>;

    @Column({ nullable: true })
    prescription_instructions!: string;

    @CreateDateColumn()
    prescription_created_at!: Date;

}