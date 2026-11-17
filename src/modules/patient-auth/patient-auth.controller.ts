import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { PatientAuthService } from "./patient-auth.service";
import { RegisterPatientDto } from "./dto/register-patient.dto";
import { PatientLoginDto } from "./dto/patient-login.dto";
import { AccessTokenGuard } from "@/modules/access/access-token.guard";

interface AuthenticatedRequest extends Request {
  user: { sub: string; role: string };
}

@Controller("auth")
export class PatientAuthController {
  constructor(private readonly patientAuthService: PatientAuthService) {}

  @Post("register")
  register(@Body() dto: RegisterPatientDto) {
    return this.patientAuthService.register(dto);
  }

  @Post("login")
  login(@Body() dto: PatientLoginDto) {
    return this.patientAuthService.login(dto);
  }

  @Get("me")
  @UseGuards(AccessTokenGuard)
  me(@Req() request: AuthenticatedRequest) {
    return { id: request.user.sub, role: request.user.role };
  }
}
