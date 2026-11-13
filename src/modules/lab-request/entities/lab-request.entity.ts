import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { PatientProfile } from "@/modules/patient/entities/patient.entity";
import { DoctorProfile } from "@/modules/doctor/entities/doctor.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
@Entity({ name: "lab_requests" })
export class LabRequest {

    @PrimaryGeneratedColumn("uuid")
    id!:string;

    @ManyToOne(() => PatientProfile)
    patient!:PatientProfile;

    @ManyToOne(() => DoctorProfile)
    doctor!:DoctorProfile;

    @ManyToOne(() => TechnicianProfile, { nullable: true })
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


