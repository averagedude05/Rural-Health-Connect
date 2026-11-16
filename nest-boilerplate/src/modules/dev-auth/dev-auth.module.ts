import { JwtModule } from "@nestjs/jwt";
import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { DevAuthController } from "./dev-auth.controller";
import { DevAuthService } from "./dev-auth.service";
import { DevJwtStrategy } from "./dev-jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_BEARER_SECRET,
      signOptions: { expiresIn: "15m" },
    }),
  ],
  controllers: [DevAuthController],
  providers: [DevAuthService, DevJwtStrategy],
})
export class DevAuthModule {}