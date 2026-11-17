import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from "@nestjs/common";
import { Request } from "express";
import { ClinicAdminGuard } from "./clinic-admin.guard";
import { ClinicAdminService } from "./clinic-admin.service";
import { ClinicAppointmentsQueryDto, UpdateClinicAppointmentDto, UpdateClinicDto, UpdateClinicServiceDto } from "./dto/clinic-admin.dto";

interface AdminRequest extends Request {
  user: { sub: string; role: string };
}

@Controller("clinic-admin")
@UseGuards(ClinicAdminGuard)
export class ClinicAdminController {
  constructor(private readonly clinicAdminService: ClinicAdminService) {}

  @Get("clinics")
  clinics(@Req() request: AdminRequest) {
    return this.clinicAdminService.findClinics(request.user.sub);
  }

  @Get("clinics/:clinicId/dashboard")
  dashboard(@Param("clinicId") clinicId: string) {
    return this.clinicAdminService.dashboard(clinicId);
  }

  @Get("clinics/:clinicId/appointments")
  appointments(@Param("clinicId") clinicId: string, @Query() query: ClinicAppointmentsQueryDto) {
    return this.clinicAdminService.appointments(clinicId, query);
  }

  @Patch("clinics/:clinicId/appointments/:appointmentId")
  updateAppointment(@Param("clinicId") clinicId: string, @Param("appointmentId") appointmentId: string, @Body() dto: UpdateClinicAppointmentDto) {
    return this.clinicAdminService.updateAppointment(clinicId, appointmentId, dto);
  }
  @Patch("clinics/:clinicId")
  updateClinic(@Param("clinicId") clinicId: string, @Body() dto: UpdateClinicDto) {
    return this.clinicAdminService.updateClinic(clinicId, dto);
  }

  @Patch("clinics/:clinicId/services/:serviceId")
  updateService(@Param("clinicId") clinicId: string, @Param("serviceId") serviceId: string, @Body() dto: UpdateClinicServiceDto) {
    return this.clinicAdminService.updateService(clinicId, serviceId, dto);
  }

  @Get("clinics/:clinicId/reports/monthly")
  monthlyReport(@Param("clinicId") clinicId: string) {
    return this.clinicAdminService.monthlyReport(clinicId);
  }
}

