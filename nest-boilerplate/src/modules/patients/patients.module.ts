import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { Clinic } from "./entities/clinic.entity";
import { ClinicServiceEntity } from "./entities/clinic-service.entity";
import { DoctorProfileEntity } from "./entities/doctor-profile.entity";
import { PatientProfile } from "./entities/patient-profile.entity";
import { ClinicsController } from "./clinics.controller";
import { PatientsController } from "./patients.controller";
import { PatientsService } from "./patients.service";
import { DoctorsController } from "./doctors.controller";
import { DoctorAvailabilityEntity } from "./entities/doctor-availability.entity";
import { AppointmentEntity } from "./entities/appointment.entity";
import { AccessModule } from "@/modules/access/access.module";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "@/config/app.config";
import { AccessTokenGuard } from "@/modules/access/access-token.guard";
@Module({
  imports: [
    JwtModule.register({
  secret: appConfig.env.JWT_BEARER_SECRET,
  signOptions: { expiresIn: appConfig.env.JWT_TTL },
}),
    TypeOrmModule.forFeature([
      PatientProfile,
      Clinic,
      ClinicServiceEntity,
      DoctorProfileEntity,
      DoctorAvailabilityEntity,
      AppointmentEntity,
    ]),
  ],
  controllers: [PatientsController, ClinicsController, DoctorsController],
  providers: [PatientsService, AccessTokenGuard],
  exports: [PatientsService],
})
export class PatientsModule {}