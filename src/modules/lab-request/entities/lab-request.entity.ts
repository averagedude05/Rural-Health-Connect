import { Entity, PrimaryGeneratedColumn, Column,CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { PatientProfile } from "@/modules/patients/entities/patient-profile.entity";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
@Entity({ name: "lab_requests" })
export class LabRequest {

    @PrimaryGeneratedColumn("uuid")
    id!:string;

    @Column()
    patient_id!:string;

    @ManyToOne(() => PatientProfile)
    @JoinColumn({name:"patient_id"})
    patient!:PatientProfile;

    @Column()
    doctor_id!:string;

    @ManyToOne(() => DoctorProfile)
    @JoinColumn({name:"doctor_id"})
    doctor!:DoctorProfile;

    @Column({ nullable: true })
    technician_id?:string;

    @ManyToOne(() => TechnicianProfile, { nullable: true })
    @JoinColumn({name:"technician_id"})
    technician?:TechnicianProfile ;

    @Column()
    test_name!:string;

    @Column({ type: "enum",enum: ["REQUESTED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], enumName: "lab_request_status_enum",default: "REQUESTED"})
    status!:string;

    @CreateDateColumn()
    requested_at!:Date;

    @Column({ nullable: true })
    file_path?:string;
    
    @Column({ nullable: true })
    result_uploaded_at?: Date;
}


