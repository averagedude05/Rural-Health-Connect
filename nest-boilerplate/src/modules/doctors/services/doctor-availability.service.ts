import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateDoctorAvailabilityDto } from "../dto/create-doctor-availability.dto";
import { UpdateDoctorAvailabilityDto } from "../dto/update-doctor-availability.dto";
import { DoctorAvailability } from "../entities/doctor-availability.entity";
import { DoctorProfile } from "../entities/doctor-profile.entity";
import { DoctorAvailabilityStatus } from "../enums/doctor-availability-status.enum";
import { DoctorVerificationStatus } from "../enums/doctor-verification-status.enum";

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(DoctorProfile)
    private readonly doctorsRepository: Repository<DoctorProfile>,
  ) {}

  async findForDoctor(doctorId: number): Promise<DoctorAvailability[]> {
    await this.findDoctor(doctorId);
    return this.availabilityRepository.find({
      where: { doctorId },
      order: { availableDate: "ASC", startTime: "ASC" },
    });
  }

  async create(
    doctorId: number,
    dto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const doctor = await this.findDoctor(doctorId);
    if (doctor.verificationStatus !== DoctorVerificationStatus.VERIFIED) {
      throw new ForbiddenException("Only a verified doctor can add availability");
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException("endTime must be later than startTime");
    }

    const overlappingSlot = await this.availabilityRepository
      .createQueryBuilder("slot")
      .where("slot.doctorId = :doctorId", { doctorId })
      .andWhere("slot.availableDate = :availableDate", {
        availableDate: dto.availableDate,
      })
      .andWhere("slot.status != :unavailable", {
        unavailable: DoctorAvailabilityStatus.UNAVAILABLE,
      })
      .andWhere("slot.startTime < :endTime AND slot.endTime > :startTime", {
        startTime: dto.startTime,
        endTime: dto.endTime,
      })
      .getOne();

    if (overlappingSlot) {
      throw new ConflictException("This time overlaps another doctor slot");
    }

    return this.availabilityRepository.save(
      this.availabilityRepository.create({
        doctorId,
        ...dto,
        status: DoctorAvailabilityStatus.AVAILABLE,
      }),
    );
  }

  async update(
    id: number,
    dto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const slot = await this.findSlot(id);
    if (slot.status === DoctorAvailabilityStatus.BOOKED) {
      throw new ConflictException("A booked slot cannot be changed here");
    }

    if (dto.status) slot.status = dto.status;
    return this.availabilityRepository.save(slot);
  }

  async remove(id: number): Promise<{ message: string }> {
    const slot = await this.findSlot(id);
    if (slot.status === DoctorAvailabilityStatus.BOOKED) {
      throw new ConflictException("A booked slot cannot be deleted");
    }

    await this.availabilityRepository.remove(slot);
    return { message: "Availability slot deleted" };
  }

  private async findDoctor(id: number): Promise<DoctorProfile> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id, isActive: true },
    });
    if (!doctor) throw new NotFoundException("Doctor not found");
    return doctor;
  }

  private async findSlot(id: number): Promise<DoctorAvailability> {
    const slot = await this.availabilityRepository.findOne({ where: { id } });
    if (!slot) throw new NotFoundException("Availability slot not found");
    return slot;
  }
}
