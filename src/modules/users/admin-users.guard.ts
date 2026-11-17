import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Request } from "express";

interface UserRequest extends Request {
  user?: { sub: string; role: string };
}

@Injectable()
export class AdminUsersGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<UserRequest>();
    if (request.user?.role?.toUpperCase() !== "ADMIN") {
      throw new ForbiddenException("Admin access required");
    }
    return true;
  }
}
