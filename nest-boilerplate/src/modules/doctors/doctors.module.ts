
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@/modules/auth/auth.module";
import { DoctorAuthGuard } from "@/modules/auth/guards/doctor-auth.guard";
import { DoctorAvailabilityController } from "./controllers/doctor-availability.controller";
import { DoctorsController } from "./controllers/doctors.controller";
import { DoctorDashboardController } from "./controllers/doctor-dashboard.controller";
import { DoctorAvailability } from "./entities/doctor-availability.entity";
import { DoctorProfile } from "./entities/doctor-profile.entity";
import { DoctorAvailabilityService } from "./services/doctor-availability.service";
import { DoctorsService } from "./services/doctors.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([DoctorProfile, DoctorAvailability]),
  ],
  controllers: [
    DoctorsController,
    DoctorAvailabilityController,
    DoctorDashboardController,
  ],
  providers: [
    DoctorsService,
    DoctorAvailabilityService,
    DoctorAuthGuard,
  ],
  exports: [DoctorsService, DoctorAvailabilityService],
})
export class DoctorsModule {}
