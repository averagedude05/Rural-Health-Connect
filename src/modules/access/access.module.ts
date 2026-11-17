import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { appConfig } from "@/config/app.config";
import { AccessTokenGuard } from "./access-token.guard";

@Module({
  imports: [JwtModule.register({ secret: appConfig.env.JWT_BEARER_SECRET, signOptions: { expiresIn: appConfig.env.JWT_TTL } })],
  providers: [AccessTokenGuard],
  exports: [AccessTokenGuard],
})
export class AccessModule {}
