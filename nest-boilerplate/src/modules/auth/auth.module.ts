import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "@/config/app.config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AdminAuthGuard } from "./guards/admin-auth.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: appConfig.env.JWT_BEARER_SECRET,
      signOptions: { expiresIn: appConfig.env.JWT_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard],
  exports: [JwtModule, AdminAuthGuard],
})
export class AuthModule {}
