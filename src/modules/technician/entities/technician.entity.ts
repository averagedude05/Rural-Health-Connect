import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { Clinic } from "@/modules/clinic/entities/clinic.entity";

@Entity("lab_technician_profiles")
export class TechnicianProfile{
    @PrimaryGeneratedColumn("uuid")
    id!: string;
    
    @Column()
    name!:string;

    @Column()
    email!:string;

    @Column()
    age!:number;

    @Column()
    address!:string;

    @Column()
    phone!:string;

    @Column({type:"uuid"})
    user_id!:string
    
    @OneToOne(() => User)
    @JoinColumn({name:" user_id"})
    user!:User;

    @Column({type:"uuid"})
    clinic_id!:string

    @ManyToOne(() => Clinic)
    @JoinColumn({name:"clinic_id"})
    clinic!:Clinic;
    
    

    
}
