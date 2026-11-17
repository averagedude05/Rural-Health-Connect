import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { isUUID } from "class-validator";

import { AccessTokenGuard } from "@/modules/access/access-token.guard";
import { Request } from "express";

import { UpdatePatientProfileDto } from "./dto/update-patient-profile.dto";
import { PatientsService } from "./patients.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

interface PatientAuthRequest extends Request {
  user?: { sub: string; role: string };
}
@Controller("patients")
@UseGuards(AccessTokenGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get("me")
  getMyProfile(@Req() request: PatientAuthRequest) {
    return this.patientsService.findByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  @Patch("me")
  updateMyProfile(
    @Req() request: PatientAuthRequest,
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    return this.patientsService.updateByUserId(
      this.getAuthenticatedUserId(request),
      updatePatientProfileDto,
    );
  }

  @Delete("me")
  deleteMyProfile(@Req() request: PatientAuthRequest) {
    return this.patientsService.deleteProfileByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  @Post("appointments")
  bookAppointment(
    @Req() request: PatientAuthRequest,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.patientsService.bookAppointment(
      this.getAuthenticatedUserId(request),
      createAppointmentDto,
    );
  }

  @Get("appointments")
  getMyAppointments(@Req() request: PatientAuthRequest) {
    return this.patientsService.getAppointmentsByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  @Patch("appointments/:id")
  updateAppointment(
    @Req() request: PatientAuthRequest,
    @Param("id", ParseUUIDPipe) appointmentId: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.patientsService.updateAppointment(
      this.getAuthenticatedUserId(request),
      appointmentId,
      updateAppointmentDto,
    );
  }

  @Patch("appointments/:id/cancel")
  cancelAppointment(
    @Req() request: PatientAuthRequest,
    @Param("id", ParseUUIDPipe) appointmentId: string,
  ) {
    return this.patientsService.cancelAppointment(
      this.getAuthenticatedUserId(request),
      appointmentId,
    );
  }

  @Get("dashboard")
  getDashboard(@Req() request: PatientAuthRequest) {
    return this.patientsService.getDashboardByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  private getAuthenticatedUserId(request: PatientAuthRequest): string {
    const userId = request.user?.sub;

    if (!userId || !isUUID(userId)) {
      throw new UnauthorizedException("Invalid authenticated user");
    }

    return userId;
  }
}