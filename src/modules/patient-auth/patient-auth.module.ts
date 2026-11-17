import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "@/config/app.config";
import { AccessModule } from "@/modules/access/access.module";
import { PatientAuthController } from "./patient-auth.controller";
import { PatientAuthService } from "./patient-auth.service";

@Module({
  imports: [JwtModule.register({ secret: appConfig.env.JWT_BEARER_SECRET, signOptions: { expiresIn: appConfig.env.JWT_TTL } }), AccessModule],
  controllers: [PatientAuthController],
  providers: [PatientAuthService],
  exports: [PatientAuthService],
})
export class PatientAuthModule {}
