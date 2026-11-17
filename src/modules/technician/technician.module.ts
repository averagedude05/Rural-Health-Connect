import { TypeOrmModule } from "@nestjs/typeorm";
import { TechnicianProfile } from "./entities/technician.entity";
import { User } from "@/modules/users/entities/user.entity";
import { Clinic } from "@/modules/patients/entities/clinic.entity";
import { TechnicianController } from "./technician.controller";
import { TechnicianService } from "./technician.service";
import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([TechnicianProfile, User, Clinic]),AuthModule,],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService,],
})
export class TechnicianModule {}
