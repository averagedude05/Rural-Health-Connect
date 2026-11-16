import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@/modules/auth/auth.module";
import { DoctorAuthGuard } from "@/modules/auth/guards/doctor-auth.guard";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { LabRequest } from "./entities/lab-request.entity";
import { LabRequestsController } from "./controllers/lab-requests.controller";
import { LabRequestsService } from "./services/lab-requests.service";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([LabRequest, DoctorProfile]),
  ],
  controllers: [LabRequestsController],
  providers: [LabRequestsService, DoctorAuthGuard],
  exports: [LabRequestsService],
})
export class LabRequestsModule {}