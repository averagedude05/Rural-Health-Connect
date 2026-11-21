import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ClinicServiceAvailability } from "@/common/enums/clinic-service-availability.enum";
import { ClinicStatus } from "@/common/enums/clinic-status.enum";
import {
  CreateClinicProfileDto,
  CreateClinicServiceDto,
  UpdateClinicProfileDto,
  UpdateClinicServiceDto,
  UpdateClinicStatusDto,
} from "./dto/clinic-admin.dto";
import {
  Clinic,
  ClinicService,
} from "./entities/clinic-admin.entity";

/** CRUD for clinics and for the services each clinic offers. */
@Injectable()
export class ClinicAdminService {
  constructor(
    @InjectRepository(Clinic)
    private readonly clinicsRepository: Repository<Clinic>,
    @InjectRepository(ClinicService)
    private readonly clinicServicesRepository: Repository<ClinicService>,
  ) {}

  private formatClinic(clinic: Clinic) {
    return {
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      location: clinic.location,
      contactNumber: clinic.contactNumber,
      description: clinic.description,
      status: clinic.status,
    };
  }

  private formatService(service: ClinicService) {
    return {
      id: service.id,
      clinicId: service.clinicId,
      serviceName: service.serviceName,
      availabilityStatus: service.availabilityStatus,
    };
  }

  // ------------------------------------------------------------ CLINICS

  async listClinics() {
    const clinics = await this.clinicsRepository.find({
      order: { name: "ASC" },
    });
    return clinics.map((clinic) => this.formatClinic(clinic));
  }

  /** Throws 404 when the clinic does not exist. Used by the other services too. */
  async getClinicById(clinicId: string): Promise<Clinic> {
    const clinic = await this.clinicsRepository.findOne({
      where: { id: clinicId },
    });
    if (!clinic) throw new NotFoundException("Clinic not found");
    return clinic;
  }

  async getClinic(clinicId: string) {
    return this.formatClinic(await this.getClinicById(clinicId));
  }

  async createClinic(dto: CreateClinicProfileDto) {
    const clinic = await this.clinicsRepository.save(
      this.clinicsRepository.create({
        name: dto.name,
        address: dto.address,
        location: dto.location ?? null,
        contactNumber: dto.contactNumber,
        description: dto.description ?? null,
        status: ClinicStatus.ACTIVE,
      }),
    );
    return this.formatClinic(clinic);
  }

  async updateClinic(clinicId: string, dto: UpdateClinicProfileDto) {
    const clinic = await this.getClinicById(clinicId);
    const updates = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );
    if (!Object.keys(updates).length) {
      throw new BadRequestException("At least one clinic field is required");
    }
    return this.formatClinic(
      await this.clinicsRepository.save(Object.assign(clinic, updates)),
    );
  }

  async updateClinicStatus(clinicId: string, dto: UpdateClinicStatusDto) {
    const clinic = await this.getClinicById(clinicId);
    clinic.status = dto.status;
    return this.formatClinic(await this.clinicsRepository.save(clinic));
  }

  /**
   * "Delete" = soft delete (status INACTIVE). Doctors, appointments and
   * medical records point at the clinic and must stay intact.
   */
  deleteClinic(clinicId: string) {
    return this.updateClinicStatus(clinicId, { status: ClinicStatus.INACTIVE });
  }

  // ----------------------------------------------------------- SERVICES

  async listServicesForClinic(clinicId: string) {
    await this.getClinicById(clinicId);
    const services = await this.clinicServicesRepository.find({
      where: { clinicId },
      order: { serviceName: "ASC" },
    });
    return services.map((service) => this.formatService(service));
  }

  private async getServiceOrFail(clinicId: string, serviceId: string) {
    const service = await this.clinicServicesRepository.findOne({
      where: { id: serviceId, clinicId },
    });
    if (!service) throw new NotFoundException("Clinic service not found");
    return service;
  }

  async getServiceForClinic(clinicId: string, serviceId: string) {
    return this.formatService(await this.getServiceOrFail(clinicId, serviceId));
  }

  async createServiceForClinic(clinicId: string, dto: CreateClinicServiceDto) {
    await this.getClinicById(clinicId);
    const service = await this.clinicServicesRepository.save(
      this.clinicServicesRepository.create({
        clinicId,
        serviceName: dto.serviceName,
        availabilityStatus:
          dto.availabilityStatus ?? ClinicServiceAvailability.AVAILABLE,
      }),
    );
    return this.formatService(service);
  }

  async updateServiceForClinic(
    clinicId: string,
    serviceId: string,
    dto: UpdateClinicServiceDto,
  ) {
    const service = await this.getServiceOrFail(clinicId, serviceId);
    if (dto.serviceName === undefined && dto.availabilityStatus === undefined) {
      throw new BadRequestException("At least one service field is required");
    }
    if (dto.serviceName !== undefined) service.serviceName = dto.serviceName;
    if (dto.availabilityStatus !== undefined) {
      service.availabilityStatus = dto.availabilityStatus;
    }
    return this.formatService(
      await this.clinicServicesRepository.save(service),
    );
  }

  async deleteServiceForClinic(clinicId: string, serviceId: string) {
    const service = await this.getServiceOrFail(clinicId, serviceId);
    await this.clinicServicesRepository.remove(service);
    return { message: "Clinic service deleted successfully" };
  }
}


