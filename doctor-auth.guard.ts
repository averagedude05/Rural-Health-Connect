import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class DoctorAuthGuard extends AuthGuard("jwt") {
  handleRequest<TUser = any>(error: unknown, user: unknown): TUser {
    if (error || !user) {
      throw error instanceof Error
        ? error
        : new UnauthorizedException("Doctor authentication required");
    }

    const current = user as { id: string; role?: string; roles?: string[] };
    if (!current.roles?.includes(Role.DOCTOR)) {
      throw new ForbiddenException("Doctor access only");
    }

    return { ...current, sub: current.id } as TUser;
  }
}
