import { Injectable } from "@nestjs/common";
import { RedisCacheService } from "@/providers/cache/redis/redis-cache.service";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
export const BLACKLISTED_TOKEN_VALUE = "blacklisted";

/** Stores explicitly logged-out access and refresh tokens until they expire. */
@Injectable()
export class AuthSessionService {
  constructor(private readonly redisCacheService: RedisCacheService) {}

  private get client() {
    return this.redisCacheService.getClient();
  }

  private async blacklistToken(
    token: string,
    expiresAtEpochSeconds: number,
  ): Promise<void> {
    const ttl = expiresAtEpochSeconds - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return;
    await this.client.set(token, BLACKLISTED_TOKEN_VALUE, { EX: ttl });
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    return (await this.client.get(token)) === BLACKLISTED_TOKEN_VALUE;
  }

  blacklistAccessToken(
    token: string,
    expiresAtEpochSeconds: number,
  ): Promise<void> {
    return this.blacklistToken(token, expiresAtEpochSeconds);
  }

  isAccessTokenBlacklisted(token: string): Promise<boolean> {
    return this.isTokenBlacklisted(token);
  }

  blacklistRefreshToken(
    token: string,
    expiresAtEpochSeconds: number,
  ): Promise<void> {
    return this.blacklistToken(token, expiresAtEpochSeconds);
  }

  isRefreshTokenBlacklisted(token: string): Promise<boolean> {
    return this.isTokenBlacklisted(token);
  }
}
