import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { PatientProfile } from "@/modules/patient/entities/patient.entity";
import { DoctorProfile } from "@/modules/doctor/entities/doctor.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
@Entity({ name: "lab_requests" })
export class LabRequest {

    @PrimaryGeneratedColumn("uuid")
    id!:string;

    @Column({type:"uuid"})
    patient_id!:string;

    @ManyToOne(() => PatientProfile)
    @JoinColumn({name:"patient_id"})
    patient!:PatientProfile;

    @Column({type:"uuid"})
    doctor_id!:string;

    @ManyToOne(() => DoctorProfile)
    @JoinColumn({name:"doctor_id"})
    doctor!:DoctorProfile;

    @Column({type:"uuid"})
    technician_id!:string;

    @ManyToOne(() => TechnicianProfile, { nullable: true })
    @JoinColumn({name:"technician_id"})
    technician?:TechnicianProfile ;

    @Column()
    test_name!:string;

    @Column({ type: "enum",enum: ["REQUESTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],default: "REQUESTED"})
    status!:string;

    @CreateDateColumn()
    requested_at!:Date;

    @Column({ nullable: true })
    file_path?:string;
    
    @Column({ nullable: true })
    result_uploaded_at?: Date;
}


