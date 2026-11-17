
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@/modules/auth/auth.module";
import { DoctorAuthGuard } from "@/modules/auth/guards/doctor-auth.guard";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { MedicalRecord } from "./entities/medical-record.entity";
import { PrescriptionsController } from "./controllers/prescriptions.controller";
import { PrescriptionsService } from "./services/prescriptions.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([MedicalRecord, DoctorProfile]),
  ],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, DoctorAuthGuard],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
