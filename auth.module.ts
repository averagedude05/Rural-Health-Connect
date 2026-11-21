import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { appConfig } from "@/config/app.config";
import { AuthGuard } from "@/common/guard/auth.guard";
import { RedisCacheModule } from "@/providers/cache/redis/redis-cache.module";
import { UsersModule } from "@/modules/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthSessionModule } from "./auth-session.module";
import { JwtStrategy } from "./jwt.strategy";
import { RefreshJwtStrategy } from "./refresh-jwt.strategy";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({ secret: appConfig.env.JWT_BEARER_SECRET }),
    UsersModule,
    AuthSessionModule,
    RedisCacheModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, AuthGuard],
  exports: [
    PassportModule,
    JwtModule,
    AuthService,
    AuthGuard,
    AuthSessionModule,
  ],
})
export class AuthModule {}
