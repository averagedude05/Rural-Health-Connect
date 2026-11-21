import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { DoctorSlotStatus } from "@/common/enums/doctor-slot-status.enum";
import { EmergencyRequestStatus } from "@/common/enums/emergency-request-status.enum";
import { ClinicAdminService } from "./clinic-admin.service";
import {
  AppointmentQueryDto,
  UpdateEmergencyRequestDto,
} from "./dto/clinic-admin.dto";
import {
  AppointmentRecord,
  ClinicPatientConsentRecord,
  DoctorAvailability,
  DoctorProfile,
  EmergencyRequestRecord,
} from "./entities/clinic-admin.entity";

const PENDING_STATUSES = ["REQUESTED", "PENDING", "BOOKED"];

@Injectable()
export class ClinicOperationsService {
  constructor(
    @InjectRepository(AppointmentRecord)
    private readonly appointmentsRepository: Repository<AppointmentRecord>,
    @InjectRepository(ClinicPatientConsentRecord)
    private readonly consentsRepository: Repository<ClinicPatientConsentRecord>,
    @InjectRepository(EmergencyRequestRecord)
    private readonly emergencyRequestsRepository: Repository<EmergencyRequestRecord>,
    @InjectRepository(DoctorProfile)
    private readonly doctorsRepository: Repository<DoctorProfile>,
    private readonly dataSource: DataSource,
    private readonly clinicAdminService: ClinicAdminService,
  ) {}

  private async findAppointmentsForClinic(
    clinicId: string,
    query: AppointmentQueryDto,
    pendingOnly = false,
  ) {
    await this.clinicAdminService.getClinicById(clinicId);
    if (query.from && query.to && query.from > query.to) {
      throw new BadRequestException("from must not be after to");
    }

    const queryBuilder = this.appointmentsRepository
      .createQueryBuilder("appointment")
      .leftJoin(
        "patient_profiles",
        "patient",
        "patient.id = appointment.patientId",
      )
      .leftJoin(
        "doctor_profiles",
        "doctor",
        "doctor.id = appointment.doctorId",
      )
      .select("appointment.id", "id")
      .addSelect("appointment.patientId", "patientId")
      .addSelect("patient.name", "patientName")
      .addSelect("appointment.doctorId", "doctorId")
      .addSelect("doctor.name", "doctorName")
      .addSelect("appointment.appointmentType", "appointmentType")
      .addSelect("appointment.appointmentTime", "appointmentTime")
      .addSelect("appointment.status", "status")
      .where("appointment.clinicId = :clinicId", { clinicId });

    if (pendingOnly) {
      queryBuilder.andWhere(
        "UPPER(appointment.status) IN (:...pendingStatuses)",
        { pendingStatuses: PENDING_STATUSES },
      );
    }
    if (query.from) {
      queryBuilder.andWhere("DATE(appointment.appointmentTime) >= :fromDate", {
        fromDate: query.from,
      });
    }
    if (query.to) {
      queryBuilder.andWhere("DATE(appointment.appointmentTime) <= :toDate", {
        toDate: query.to,
      });
    }

    const total = await queryBuilder.clone().getCount();
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;
    const data = await queryBuilder
      .clone()
      .orderBy("appointment.appointmentTime", "ASC")
      .skip(offset)
      .take(limit)
      .getRawMany();

    return { data, total, limit, offset };
  }

  getAppointmentRequestsForClinic(
    clinicId: string,
    query: AppointmentQueryDto,
  ) {
    return this.findAppointmentsForClinic(clinicId, query, true);
  }

  getAppointmentCalendarForClinic(
    clinicId: string,
    query: AppointmentQueryDto,
  ) {
    if (!query.from || !query.to) {
      throw new BadRequestException("Calendar requires from and to dates");
    }
    return this.findAppointmentsForClinic(clinicId, {
      ...query,
      limit: 100,
      offset: 0,
    });
  }

  async decideAppointment(
    clinicId: string,
    appointmentId: string,
    decision: "APPROVED" | "REJECTED",
  ) {
    return this.dataSource.transaction(async (manager) => {
      const appointments = manager.getRepository(AppointmentRecord);
      const appointment = await appointments
        .createQueryBuilder("appointment")
        .setLock("pessimistic_write")
        .where("appointment.id = :appointmentId", { appointmentId })
        .andWhere("appointment.clinicId = :clinicId", { clinicId })
        .getOne();

      if (!appointment) {
        throw new NotFoundException("Appointment not found in clinic");
      }
      if (!PENDING_STATUSES.includes(appointment.status.toUpperCase())) {
        throw new BadRequestException("Only pending requests can be decided");
      }

      appointment.status = decision;
      const updated = await appointments.save(appointment);

      if (decision === "REJECTED") {
        const availabilityRepository = manager.getRepository(DoctorAvailability);
        const availability = await availabilityRepository
          .createQueryBuilder("availability")
          .setLock("pessimistic_write")
          .where("availability.doctorId = :doctorId", {
            doctorId: appointment.doctorId,
          })
          .andWhere(
            "availability.availableDate = CAST(:appointmentTime AS date)",
            { appointmentTime: appointment.appointmentTime },
          )
          .andWhere(
            "availability.startTime = CAST(:appointmentTime AS time)",
            { appointmentTime: appointment.appointmentTime },
          )
          .andWhere("availability.slotStatus = :taken", {
            taken: DoctorSlotStatus.TAKEN,
          })
          .getOne();

        if (availability) {
          availability.slotStatus = DoctorSlotStatus.AVAILABLE;
          await availabilityRepository.save(availability);
        }
      }

      return {
        id: updated.id,
        status: updated.status,
        appointmentTime: updated.appointmentTime,
      };
    });
  }

  async listConsentsForClinic(clinicId: string) {
    await this.clinicAdminService.getClinicById(clinicId);
    return this.consentsRepository
      .createQueryBuilder("consent")
      .leftJoin(
        "patient_profiles",
        "patient",
        "patient.id = consent.patientId",
      )
      .select("consent.id", "id")
      .addSelect("consent.patientId", "patientId")
      .addSelect("patient.name", "patientName")
      .addSelect("consent.status", "status")
      .addSelect("consent.grantedAt", "grantedAt")
      .addSelect("consent.revokedAt", "revokedAt")
      .where("consent.clinicId = :clinicId", { clinicId })
      .orderBy("consent.grantedAt", "DESC")
      .getRawMany();
  }

  async listEmergencyRequests(
    clinicId: string,
    status?: EmergencyRequestStatus,
  ) {
    await this.clinicAdminService.getClinicById(clinicId);
    const queryBuilder = this.emergencyRequestsRepository
      .createQueryBuilder("emergency")
      .leftJoin(
        "patient_profiles",
        "patient",
        "patient.id = emergency.patientId",
      )
      .leftJoin(
        "doctor_profiles",
        "doctor",
        "doctor.id = emergency.assignedDoctorId",
      )
      .select("emergency.id", "id")
      .addSelect("emergency.patientId", "patientId")
      .addSelect("patient.name", "patientName")
      .addSelect("emergency.assignedDoctorId", "assignedDoctorId")
      .addSelect("doctor.name", "assignedDoctorName")
      .addSelect("emergency.description", "description")
      .addSelect("emergency.priority", "priority")
      .addSelect("emergency.status", "status")
      .where("emergency.clinicId = :clinicId", { clinicId });

    if (status) {
      queryBuilder.andWhere("emergency.status = :status", { status });
    }

    return queryBuilder
      .orderBy(
        "CASE emergency.priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END",
        "ASC",
      )
      .addOrderBy("emergency.id", "DESC")
      .getRawMany();
  }

  async updateEmergencyRequest(
    clinicId: string,
    requestId: string,
    dto: UpdateEmergencyRequestDto,
  ) {
    if (dto.status === undefined && dto.assignedDoctorId === undefined) {
      throw new BadRequestException("No emergency fields supplied");
    }
    await this.clinicAdminService.getClinicById(clinicId);

    if (dto.assignedDoctorId) {
      const doctor = await this.doctorsRepository.findOne({
        where: { id: dto.assignedDoctorId, clinicId },
      });
      if (!doctor) {
        throw new NotFoundException("Doctor not found in clinic");
      }
    }

    const emergency = await this.emergencyRequestsRepository.findOne({
      where: { id: requestId, clinicId },
    });
    if (!emergency) {
      throw new NotFoundException("Emergency request not found in clinic");
    }

    if (dto.status !== undefined) emergency.status = dto.status;
    if (dto.assignedDoctorId !== undefined) {
      emergency.assignedDoctorId = dto.assignedDoctorId;
    }

    const updated = await this.emergencyRequestsRepository.save(emergency);
    return {
      id: updated.id,
      patientId: updated.patientId,
      assignedDoctorId: updated.assignedDoctorId,
      description: updated.description,
      priority: updated.priority,
      status: updated.status,
    };
  }
}
