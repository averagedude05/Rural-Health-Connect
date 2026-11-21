import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { AccountStatus } from "@/common/enums/account-status.enum";
import { DoctorSlotStatus } from "@/common/enums/doctor-slot-status.enum";
import { Role } from "@/common/enums/role.enum";
import { isUniqueViolation } from "@/common/helpers/database-error.helper";
import { UsersService } from "@/modules/users/users.service";
import { ClinicAdminService } from "./clinic-admin.service";
import {
  ChangeDoctorStatusDto,
  CreateDoctorAvailabilityDto,
  CreateDoctorDto,
  UpdateDoctorAvailabilityDto,
  UpdateDoctorDto,
} from "./dto/clinic-admin.dto";
import {
  DoctorAvailability,
  DoctorProfile,
} from "./entities/clinic-admin.entity";

const toSeconds = (value: string) => {
  const [hours, minutes, seconds = "0"] = value.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

// "09:00" -> "09:00:00", so create/update return the same format as list.
const normalizeTime = (value: string) =>
  value.split(":").length === 2 ? `${value}:00` : value;

/** Doctor accounts of a clinic and their availability slots (full CRUD). */
@Injectable()
export class ClinicDoctorsService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorsRepository: Repository<DoctorProfile>,
    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepository: Repository<DoctorAvailability>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly clinicAdminService: ClinicAdminService,
  ) {}

  private formatDoctor(doctor: DoctorProfile) {
    return {
      doctorProfileId: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      specialization: doctor.specialization,
      phone: doctor.user?.phone,
      accountStatus: doctor.user?.accountStatus,
    };
  }

  private formatSlot(slot: DoctorAvailability) {
    return {
      id: slot.id,
      doctorId: slot.doctorId,
      availableDate: slot.availableDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotStatus: slot.slotStatus,
    };
  }

  /** The doctor must belong to the clinic from the URL, otherwise 404. */
  private async getDoctorOrFail(clinicId: string, doctorId: string) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId, clinicId },
      relations: { user: true },
    });
    if (!doctor) throw new NotFoundException("Doctor not found in clinic");
    return doctor;
  }

  // ------------------------------------------------------------ DOCTORS

  async listDoctors(clinicId: string) {
    await this.clinicAdminService.getClinicById(clinicId);
    const doctors = await this.doctorsRepository.find({
      where: { clinicId },
      relations: { user: true },
      order: { name: "ASC" },
    });
    return doctors.map((doctor) => this.formatDoctor(doctor));
  }

  async getDoctor(clinicId: string, doctorId: string) {
    return this.formatDoctor(await this.getDoctorOrFail(clinicId, doctorId));
  }

  /** users row + doctor_profiles row, all or nothing. */
  async createDoctor(clinicId: string, dto: CreateDoctorDto) {
    await this.clinicAdminService.getClinicById(clinicId);

    return this.dataSource.transaction(async (manager) => {
      const user = await this.usersService.createAccount(
        { role: Role.DOCTOR, phone: dto.phone, password: dto.password },
        manager,
      );
      const doctors = manager.getRepository(DoctorProfile);
      const doctor = await doctors.save(
        doctors.create({
          userId: user.id,
          clinicId,
          name: dto.name,
          specialization: dto.specialization,
        }),
      );
      return {
        doctorProfileId: doctor.id,
        userId: user.id,
        clinicId,
        name: doctor.name,
        specialization: doctor.specialization,
        phone: user.phone,
        accountStatus: user.accountStatus,
      };
    });
  }

  async updateDoctor(clinicId: string, doctorId: string, dto: UpdateDoctorDto) {
    if (dto.name === undefined && dto.specialization === undefined) {
      throw new BadRequestException("At least one doctor field is required");
    }
    const doctor = await this.getDoctorOrFail(clinicId, doctorId);
    if (dto.name !== undefined) doctor.name = dto.name;
    if (dto.specialization !== undefined) {
      doctor.specialization = dto.specialization;
    }
    await this.doctorsRepository.save(doctor);
    return {
      doctorProfileId: doctor.id,
      userId: doctor.userId,
      name: doctor.name,
      specialization: doctor.specialization,
    };
  }

  async updateDoctorStatus(
    clinicId: string,
    doctorId: string,
    dto: ChangeDoctorStatusDto,
  ) {
    const doctor = await this.getDoctorOrFail(clinicId, doctorId);
    const user = await this.usersService.updateStatus(
      doctor.userId,
      dto.accountStatus,
    );
    return {
      doctorProfileId: doctor.id,
      userId: user.id,
      accountStatus: user.accountStatus,
    };
  }

  /**
   * "Delete" = soft delete (account suspended). The doctor stays in the
   * database because appointments and medical records reference the profile.
   */
  deleteDoctor(clinicId: string, doctorId: string) {
    return this.updateDoctorStatus(clinicId, doctorId, {
      accountStatus: AccountStatus.SUSPENDED,
    });
  }

  // ------------------------------------------------------- AVAILABILITY

  private async getSlotOrFail(clinicId: string, doctorId: string, id: string) {
    await this.getDoctorOrFail(clinicId, doctorId);
    const slot = await this.availabilityRepository.findOne({
      where: { id, doctorId },
    });
    if (!slot) throw new NotFoundException("Availability slot not found");
    return slot;
  }

  private assertValidRange(startTime: string, endTime: string) {
    if (toSeconds(startTime) >= toSeconds(endTime)) {
      throw new BadRequestException("startTime must be before endTime");
    }
  }

  private async assertNoOverlap(
    doctorId: string,
    date: string,
    startTime: string,
    endTime: string,
    ignoreSlotId?: string,
  ) {
    const query = this.availabilityRepository
      .createQueryBuilder("slot")
      .where("slot.doctorId = :doctorId", { doctorId })
      .andWhere("slot.availableDate = :date", { date })
      .andWhere("slot.startTime < :endTime", { endTime })
      .andWhere("slot.endTime > :startTime", { startTime });
    if (ignoreSlotId)
      query.andWhere("slot.id <> :ignoreSlotId", { ignoreSlotId });

    if (await query.getExists()) {
      throw new ConflictException("This time overlaps an existing slot");
    }
  }

  async listDoctorAvailability(clinicId: string, doctorId: string) {
    await this.getDoctorOrFail(clinicId, doctorId);
    const slots = await this.availabilityRepository.find({
      where: { doctorId },
      order: { availableDate: "ASC", startTime: "ASC" },
    });
    return slots.map((slot) => this.formatSlot(slot));
  }

  async createDoctorAvailability(
    clinicId: string,
    doctorId: string,
    dto: CreateDoctorAvailabilityDto,
  ) {
    this.assertValidRange(dto.startTime, dto.endTime);
    await this.getDoctorOrFail(clinicId, doctorId);
    await this.assertNoOverlap(
      doctorId,
      dto.availableDate,
      dto.startTime,
      dto.endTime,
    );

    try {
      const slot = await this.availabilityRepository.save(
        this.availabilityRepository.create({
          doctorId,
          availableDate: dto.availableDate,
          startTime: normalizeTime(dto.startTime),
          endTime: normalizeTime(dto.endTime),
        }),
      );
      return this.formatSlot(slot);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("A slot already exists at that start time");
      }
      throw error;
    }
  }

  async updateDoctorAvailability(
    clinicId: string,
    doctorId: string,
    availabilityId: string,
    dto: UpdateDoctorAvailabilityDto,
  ) {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new BadRequestException("At least one slot field is required");
    }
    const slot = await this.getSlotOrFail(clinicId, doctorId, availabilityId);
    if (slot.slotStatus === DoctorSlotStatus.TAKEN) {
      throw new ConflictException("A booked slot cannot be changed");
    }

    const availableDate = dto.availableDate ?? slot.availableDate;
    const startTime = normalizeTime(dto.startTime ?? slot.startTime);
    const endTime = normalizeTime(dto.endTime ?? slot.endTime);
    this.assertValidRange(startTime, endTime);

    const timingChanged =
      dto.availableDate !== undefined ||
      dto.startTime !== undefined ||
      dto.endTime !== undefined;
    if (timingChanged) {
      await this.assertNoOverlap(
        doctorId,
        availableDate,
        startTime,
        endTime,
        slot.id,
      );
    }

    slot.availableDate = availableDate;
    slot.startTime = startTime;
    slot.endTime = endTime;
    if (dto.slotStatus !== undefined) slot.slotStatus = dto.slotStatus;

    try {
      return this.formatSlot(await this.availabilityRepository.save(slot));
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("A slot already exists at that start time");
      }
      throw error;
    }
  }

  async deleteDoctorAvailability(
    clinicId: string,
    doctorId: string,
    availabilityId: string,
  ) {
    const slot = await this.getSlotOrFail(clinicId, doctorId, availabilityId);
    if (slot.slotStatus === DoctorSlotStatus.TAKEN) {
      throw new ConflictException("A booked slot cannot be deleted");
    }
    await this.availabilityRepository.remove(slot);
    return { message: "Availability slot deleted successfully" };
  }
}


