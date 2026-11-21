import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { IRequest } from "@/common/interfaces/request.interface";
import { ValidationPipe } from "@/common/pipes/validation.pipe";
import { ClinicAdminService } from "./clinic-admin.service";
import { ClinicDoctorsService } from "./clinic-doctors.service";
import { ClinicOperationsService } from "./clinic-operations.service";
import { ClinicReportsService } from "./clinic-reports.service";
import {
  AppointmentQueryDto,
  ChangeDoctorStatusDto,
  CreateClinicProfileDto,
  CreateClinicServiceDto,
  CreateDoctorAvailabilityDto,
  CreateDoctorDto,
  EmergencyRequestQueryDto,
  MonthQueryDto,
  UpdateClinicProfileDto,
  UpdateClinicServiceDto,
  UpdateClinicStatusDto,
  UpdateDoctorAvailabilityDto,
  UpdateDoctorDto,
  UpdateEmergencyRequestDto,
} from "./dto/clinic-admin.dto";
/** Clinics and clinic services: full CRUD. System administrator only. */
@ApiTags("Admin - Clinics")
@ApiBearerAuth()
@Controller("admin")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClinicAdminController {
  constructor(private readonly clinicAdminService: ClinicAdminService) {}

  @Get("me")
  getCurrentAdmin(@Req() req: IRequest) {
    if (!req.user) throw new UnauthorizedException("User not authenticated");
    return { id: req.user.id, role: req.user.role, roles: req.user.roles };
  }

  // ------------------------------------------------------------ clinics

  @Get("clinics")
  listClinics() {
    return this.clinicAdminService.listClinics();
  }

  @Post("clinics")
  createClinic(@Body(new ValidationPipe()) dto: CreateClinicProfileDto) {
    return this.clinicAdminService.createClinic(dto);
  }

  @Get("clinics/:clinicId")
  getClinic(@Param("clinicId", new ParseUUIDPipe()) clinicId: string) {
    return this.clinicAdminService.getClinic(clinicId);
  }

  @Patch("clinics/:clinicId")
  updateClinic(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Body(new ValidationPipe()) dto: UpdateClinicProfileDto,
  ) {
    return this.clinicAdminService.updateClinic(clinicId, dto);
  }

  @Patch("clinics/:clinicId/status")
  updateClinicStatus(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Body(new ValidationPipe()) dto: UpdateClinicStatusDto,
  ) {
    return this.clinicAdminService.updateClinicStatus(clinicId, dto);
  }

  @Delete("clinics/:clinicId")
  deleteClinic(@Param("clinicId", new ParseUUIDPipe()) clinicId: string) {
    return this.clinicAdminService.deleteClinic(clinicId);
  }

  // ----------------------------------------------------------- services

  @Get("clinics/:clinicId/services")
  listServices(@Param("clinicId", new ParseUUIDPipe()) clinicId: string) {
    return this.clinicAdminService.listServicesForClinic(clinicId);
  }

  @Post("clinics/:clinicId/services")
  createService(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Body(new ValidationPipe()) dto: CreateClinicServiceDto,
  ) {
    return this.clinicAdminService.createServiceForClinic(clinicId, dto);
  }

  @Get("clinics/:clinicId/services/:serviceId")
  getService(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("serviceId", new ParseUUIDPipe()) serviceId: string,
  ) {
    return this.clinicAdminService.getServiceForClinic(clinicId, serviceId);
  }

  @Patch("clinics/:clinicId/services/:serviceId")
  updateService(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("serviceId", new ParseUUIDPipe()) serviceId: string,
    @Body(new ValidationPipe()) dto: UpdateClinicServiceDto,
  ) {
    return this.clinicAdminService.updateServiceForClinic(
      clinicId,
      serviceId,
      dto,
    );
  }

  @Delete("clinics/:clinicId/services/:serviceId")
  deleteService(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("serviceId", new ParseUUIDPipe()) serviceId: string,
  ) {
    return this.clinicAdminService.deleteServiceForClinic(clinicId, serviceId);
  }
}

/** Doctors of a clinic and their availability slots: full CRUD. */
@ApiTags("Admin - Doctors")
@ApiBearerAuth()
@Controller("admin/clinics/:clinicId/doctors")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClinicDoctorsController {
  constructor(private readonly clinicDoctorsService: ClinicDoctorsService) {}

  @Get()
  listDoctors(@Param("clinicId", new ParseUUIDPipe()) clinicId: string) {
    return this.clinicDoctorsService.listDoctors(clinicId);
  }

  @Post()
  createDoctor(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Body(new ValidationPipe()) dto: CreateDoctorDto,
  ) {
    return this.clinicDoctorsService.createDoctor(clinicId, dto);
  }

  @Get(":doctorId")
  getDoctor(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
  ) {
    return this.clinicDoctorsService.getDoctor(clinicId, doctorId);
  }

  @Patch(":doctorId")
  updateDoctor(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
    @Body(new ValidationPipe()) dto: UpdateDoctorDto,
  ) {
    return this.clinicDoctorsService.updateDoctor(clinicId, doctorId, dto);
  }

  @Patch(":doctorId/status")
  updateDoctorStatus(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
    @Body(new ValidationPipe()) dto: ChangeDoctorStatusDto,
  ) {
    return this.clinicDoctorsService.updateDoctorStatus(
      clinicId,
      doctorId,
      dto,
    );
  }

  @Delete(":doctorId")
  deleteDoctor(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
  ) {
    return this.clinicDoctorsService.deleteDoctor(clinicId, doctorId);
  }

  // ------------------------------------------------------- availability

  @Get(":doctorId/availability")
  listAvailability(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
  ) {
    return this.clinicDoctorsService.listDoctorAvailability(clinicId, doctorId);
  }

  @Post(":doctorId/availability")
  createAvailability(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
    @Body(new ValidationPipe()) dto: CreateDoctorAvailabilityDto,
  ) {
    return this.clinicDoctorsService.createDoctorAvailability(
      clinicId,
      doctorId,
      dto,
    );
  }

  @Patch(":doctorId/availability/:availabilityId")
  updateAvailability(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
    @Param("availabilityId", new ParseUUIDPipe()) availabilityId: string,
    @Body(new ValidationPipe()) dto: UpdateDoctorAvailabilityDto,
  ) {
    return this.clinicDoctorsService.updateDoctorAvailability(
      clinicId,
      doctorId,
      availabilityId,
      dto,
    );
  }

  @Delete(":doctorId/availability/:availabilityId")
  deleteAvailability(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
    @Param("availabilityId", new ParseUUIDPipe()) availabilityId: string,
  ) {
    return this.clinicDoctorsService.deleteDoctorAvailability(
      clinicId,
      doctorId,
      availabilityId,
    );
  }
}

/** Appointment decisions, emergency triage and consent overview. */
@ApiTags("Admin - Operations")
@ApiBearerAuth()
@Controller("admin/clinics/:clinicId")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClinicOperationsController {
  constructor(private readonly operationsService: ClinicOperationsService) {}

  @Get("appointments/requests")
  getAppointmentRequests(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Query(new ValidationPipe()) query: AppointmentQueryDto,
  ) {
    return this.operationsService.getAppointmentRequestsForClinic(
      clinicId,
      query,
    );
  }

  @Get("appointments/calendar")
  getAppointmentCalendar(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Query(new ValidationPipe()) query: AppointmentQueryDto,
  ) {
    return this.operationsService.getAppointmentCalendarForClinic(
      clinicId,
      query,
    );
  }

  @Patch("appointments/:appointmentId/approve")
  approveAppointment(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("appointmentId", new ParseUUIDPipe()) appointmentId: string,
  ) {
    return this.operationsService.decideAppointment(
      clinicId,
      appointmentId,
      "APPROVED",
    );
  }

  @Patch("appointments/:appointmentId/reject")
  rejectAppointment(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("appointmentId", new ParseUUIDPipe()) appointmentId: string,
  ) {
    return this.operationsService.decideAppointment(
      clinicId,
      appointmentId,
      "REJECTED",
    );
  }

  @Get("medical-record-access")
  listMedicalRecordConsents(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
  ) {
    return this.operationsService.listConsentsForClinic(clinicId);
  }

  @Get("emergency-requests")
  listEmergencyRequests(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Query(new ValidationPipe()) query: EmergencyRequestQueryDto,
  ) {
    return this.operationsService.listEmergencyRequests(clinicId, query.status);
  }

  @Patch("emergency-requests/:requestId")
  updateEmergencyRequest(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Param("requestId", new ParseUUIDPipe()) requestId: string,
    @Body(new ValidationPipe()) dto: UpdateEmergencyRequestDto,
  ) {
    return this.operationsService.updateEmergencyRequest(
      clinicId,
      requestId,
      dto,
    );
  }
}

/** System-wide and per-clinic analytics and monthly reports. */
@ApiTags("Admin - Reports")
@ApiBearerAuth()
@Controller("admin")
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ClinicReportsController {
  constructor(private readonly reportsService: ClinicReportsService) {}

  @Get("analytics")
  getSystemAnalytics() {
    return this.reportsService.getSystemAnalytics();
  }

  @Get("reports/monthly")
  getSystemMonthlyReport(@Query(new ValidationPipe()) query: MonthQueryDto) {
    return this.reportsService.getSystemMonthlyReport(query.month);
  }

  @Get("clinics/:clinicId/analytics")
  getAnalytics(@Param("clinicId", new ParseUUIDPipe()) clinicId: string) {
    return this.reportsService.getAnalyticsForClinic(clinicId);
  }

  @Get("clinics/:clinicId/reports/monthly")
  getMonthlyReport(
    @Param("clinicId", new ParseUUIDPipe()) clinicId: string,
    @Query(new ValidationPipe()) query: MonthQueryDto,
  ) {
    return this.reportsService.getMonthlyReportForClinic(clinicId, query.month);
  }
}
