import { TypeOrmModule } from "@nestjs/typeorm";
import { TechnicianProfile } from "./entities/technician.entity";
import { User } from "@/modules/users/entities/user.entity";
import { Clinic } from "@/modules/clinic/entities/clinic.entity";
import { TechnicianController } from "./technician.controller";
import { TechnicianService } from "./technician.service";
import { Module } from "@nestjs/common";
import { LabRequestModule } from "../lab-request/lab-request.module";
import { AuthModule } from "../auth/auth.module";


@Module({
  imports: [TypeOrmModule.forFeature([TechnicianProfile, User, Clinic]),LabRequestModule,AuthModule],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService,],
})
export class TechnicianModule {}
