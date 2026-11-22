import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabRequest } from "./entities/lab-request.entity";
import { PatientProfile } from "@/modules/patients/entities/patient-profile.entity";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
import { LabRequestController } from "./lab-request.controller";
import { LabRequestService } from "./lab-request.service";
@Module({
    imports: [TypeOrmModule.forFeature([LabRequest,PatientProfile,DoctorProfile,TechnicianProfile])],
    controllers: [LabRequestController],
    providers: [LabRequestService],
    exports: [LabRequestService]
})
export class LabRequestModule{}
