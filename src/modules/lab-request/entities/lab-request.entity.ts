import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { PatientProfile } from "@/modules/patient/entities/patient.entity.ts";
import { DoctorProfile } from "@/modules/doctor/entities/doctor.entity.ts";
import { TechnicianProfile } from "@/modules/techinician/entities/technician.entity.ts";
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

    @Column()
    status!:string;

    @CreateDateColumn()
    requested_at!:Date;

    @Column({ nullable: true })
    file_path?:string;
    
    @Column({ nullable: true })
    result_uploaded_at?: Date;
}


