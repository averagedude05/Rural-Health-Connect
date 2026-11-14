import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LabRequest } from "./entities/lab-request.entity";
import { PatientProfile } from "@/modules/patient/entities/patient.entity";
import { DoctorProfile } from "@/modules/doctor/entities/doctor.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
import { LabRequestController } from "./lab-request.controller";
import { LabRequestService } from "./lab-request.service";
@Module({
    imports: [TypeOrmModule.forFeature([LabRequest,PatientProfile,DoctorProfile,TechnicianProfile])],
    controllers: [LabRequestController],
    providers: [LabRequestService],
    exports: [LabRequestService]
})
export class LabRequestModule {}
