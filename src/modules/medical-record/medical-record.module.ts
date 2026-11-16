import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedicalRecord } from "./entities/medical-record.entity";
import { PatientProfile } from "../patient/entities/patient.entity";
import { DoctorProfile } from "../doctor/entities/doctor.entity";
import { Clinic } from "../clinic/entities/clinic.entity";
import { MedicalRecordController } from "./medical-record.controller";
import { MedicalRecordService } from "./medical-record.service";

@Module({
    imports: [TypeOrmModule.forFeature([MedicalRecord, PatientProfile, DoctorProfile, Clinic])],
    controllers: [MedicalRecordController],
    providers: [MedicalRecordService],
    exports: [MedicalRecordService],
})
export class MedicalRecordModule {}