import { TypeOrmModule } from "@nestjs/typeorm";
import { TechnicianProfile } from "./entities/technician.entity";
import { User } from "../user/entities/user.entity";
import { Clinic } from "../clinic/entities/clinic.entity";
import { TechnicianController } from "./technician.controller";
import { TechnicianService } from "./technician.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [TypeOrmModule.forFeature([TechnicianProfile, User, Clinic])],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService],
})
export class TechnicianModule {}