import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "@/config/app.config";
import { ClinicAdminController } from "./clinic-admin.controller";
import { ClinicAdminGuard } from "./clinic-admin.guard";
import { ClinicAdminService } from "./clinic-admin.service";

@Module({
  imports: [JwtModule.register({ secret: appConfig.env.JWT_BEARER_SECRET, signOptions: { expiresIn: appConfig.env.JWT_TTL } })],
  controllers: [ClinicAdminController],
  providers: [ClinicAdminGuard, ClinicAdminService],
})
export class ClinicAdminModule {}
