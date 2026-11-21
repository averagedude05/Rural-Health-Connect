import {
  ClinicAdminController,
  ClinicDoctorsController,
  ClinicOperationsController,
  ClinicReportsController,
} from "./clinic-admin.controller";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RolesGuard } from "@/common/guard/roles.guard";
import { AuthModule } from "@/modules/auth/auth.module";
import { UsersModule } from "@/modules/users/users.module";
import { ClinicAdminService } from "./clinic-admin.service";
import { ClinicDoctorsService } from "./clinic-doctors.service";
import { ClinicOperationsService } from "./clinic-operations.service";
import { ClinicReportsService } from "./clinic-reports.service";
import {
  AppointmentRecord,
  Clinic,
  ClinicPatientConsentRecord,
  ClinicService,
  DoctorAvailability,
  DoctorProfile,
  EmergencyRequestRecord,
} from "./entities/clinic-admin.entity";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([
      Clinic,
      ClinicService,
      DoctorProfile,
      DoctorAvailability,
      AppointmentRecord,
      ClinicPatientConsentRecord,
      EmergencyRequestRecord,
    ]),
  ],
  controllers: [
    ClinicAdminController,
    ClinicDoctorsController,
    ClinicOperationsController,
    ClinicReportsController,
  ],
  providers: [
    RolesGuard,
    ClinicAdminService,
    ClinicDoctorsService,
    ClinicOperationsService,
    ClinicReportsService,
  ],
  exports: [ClinicAdminService],
})
export class ClinicAdminModule {}
