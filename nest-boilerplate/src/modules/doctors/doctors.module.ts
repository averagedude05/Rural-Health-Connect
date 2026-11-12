import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DoctorAvailabilityController } from "./controllers/doctor-availability.controller";
import { DoctorsController } from "./controllers/doctors.controller";
import { DoctorAvailability } from "./entities/doctor-availability.entity";
import { DoctorProfile } from "./entities/doctor-profile.entity";
import { DoctorAvailabilityService } from "./services/doctor-availability.service";
import { DoctorsService } from "./services/doctors.service";

@Module({
  imports: [TypeOrmModule.forFeature([DoctorProfile, DoctorAvailability])],
  controllers: [DoctorsController, DoctorAvailabilityController],
  providers: [DoctorsService, DoctorAvailabilityService],
  exports: [DoctorsService, DoctorAvailabilityService],
})
export class DoctorsModule {}
