import {
  Body,
  Controller,
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

import { JwtGuard } from "@/common/guard/jwt.guard";
import { IRequest } from "@/common/interfaces/request.interface";

import { UpdatePatientProfileDto } from "./dto/update-patient-profile.dto";
import { PatientsService } from "./patients.service";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

@Controller("patients")
@UseGuards(JwtGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get("me")
  getMyProfile(@Req() request: IRequest) {
    return this.patientsService.findByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  @Patch("me")
  updateMyProfile(
    @Req() request: IRequest,
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    return this.patientsService.updateByUserId(
      this.getAuthenticatedUserId(request),
      updatePatientProfileDto,
    );
  }

  @Post("appointments")
  bookAppointment(
    @Req() request: IRequest,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.patientsService.bookAppointment(
      this.getAuthenticatedUserId(request),
      createAppointmentDto,
    );
  }

  @Get("appointments")
  getMyAppointments(@Req() request: IRequest) {
    return this.patientsService.getAppointmentsByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  @Patch("appointments/:id")
  updateAppointment(
    @Req() request: IRequest,
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
    @Req() request: IRequest,
    @Param("id", ParseUUIDPipe) appointmentId: string,
  ) {
    return this.patientsService.cancelAppointment(
      this.getAuthenticatedUserId(request),
      appointmentId,
    );
  }

  @Get("dashboard")
  getDashboard(@Req() request: IRequest) {
    return this.patientsService.getDashboardByUserId(
      this.getAuthenticatedUserId(request),
    );
  }

  private getAuthenticatedUserId(request: IRequest): string {
    const userId = request.user?.id;

    if (!userId || !isUUID(userId)) {
      throw new UnauthorizedException("Invalid authenticated user");
    }

    return userId;
  }
}
