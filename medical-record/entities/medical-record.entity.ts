import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { PatientProfile } from "@/modules/patients/entities/patient-profile.entity";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { Clinic } from "@/modules/clinic/entities/clinic.entity";

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
    notes?: string;

    @Column({ type: "enum",enum: ["PRIVATE", "SHARED"], enumName: "medical_record_access_status_enum",default: "PRIVATE"})
    access_status!: string;

    @Column({ type: "jsonb",nullable: true })
    medicine_details!: Record<string,string>;

    @Column({ nullable: true })
    prescription_instructions?: string;

    @CreateDateColumn()
    prescription_created_at!: Date;

}
