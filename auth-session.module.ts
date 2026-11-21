import { Module } from "@nestjs/common";
import { RedisCacheModule } from "@/providers/cache/redis/redis-cache.module";
import { AuthSessionService } from "./auth-session.service";

/** Shared Redis-backed blacklist for explicitly logged-out JWTs. */
@Module({
  imports: [RedisCacheModule],
  providers: [AuthSessionService],
  exports: [AuthSessionService],
})
export class AuthSessionModule {}
