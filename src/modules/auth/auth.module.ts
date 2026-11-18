import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { appConfig } from "@/config/app.config";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AdminAuthGuard } from "./guards/admin-auth.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    TypeOrmModule.forFeature([TechnicianProfile]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: appConfig.env.JWT_BEARER_SECRET,
      signOptions: { expiresIn: appConfig.env.JWT_TTL },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminAuthGuard, JwtStrategy],
  exports: [JwtModule, AdminAuthGuard],
})
export class AuthModule {}
