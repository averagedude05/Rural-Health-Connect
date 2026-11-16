
import {
  BadRequestException,
  ConflictException,
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

@Injectable()
export class DoctorAvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepository: Repository<DoctorAvailability>,

    @InjectRepository(DoctorProfile)
    private readonly doctorsRepository: Repository<DoctorProfile>,
  ) {}

  // Public: Find availability for a doctor
  async findForDoctor(doctorId: string): Promise<DoctorAvailability[]> {
    await this.findDoctor(doctorId);

    return this.availabilityRepository.find({
      where: { doctorId },
      order: {
        availableDate: "ASC",
        startTime: "ASC",
      },
    });
  }

  // Doctor: Create own availability
  async create(
    userId: string,
    dto: CreateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const doctor = await this.findDoctorByUserId(userId);

    if (!this.isFutureOrCurrentDate(dto.availableDate, dto.startTime)) {
      throw new BadRequestException(
        "Availability must be in the future",
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        "endTime must be later than startTime",
      );
    }

    await this.ensureNoOverlap(
      doctor.id,
      dto.availableDate,
      dto.startTime,
      dto.endTime,
    );

    return this.availabilityRepository.save(
      this.availabilityRepository.create({
        doctorId: doctor.id,
        ...dto,
        status: DoctorAvailabilityStatus.AVAILABLE,
      }),
    );
  }

  // Doctor: Update own availability
  async update(
    userId: string,
    id: string,
    dto: UpdateDoctorAvailabilityDto,
  ): Promise<DoctorAvailability> {
    const slot = await this.findOwnedSlot(userId, id);

    if (slot.status === DoctorAvailabilityStatus.TAKEN) {
      throw new ConflictException(
        "A booked slot cannot be changed here",
      );
    }

    const availableDate = dto.availableDate ?? slot.availableDate;
    const startTime = dto.startTime ?? slot.startTime;
    const endTime = dto.endTime ?? slot.endTime;
    const status = dto.status ?? slot.status;

    if (startTime >= endTime) {
      throw new BadRequestException(
        "endTime must be later than startTime",
      );
    }

    if (status === DoctorAvailabilityStatus.AVAILABLE) {
      if (!this.isFutureOrCurrentDate(availableDate, startTime)) {
        throw new BadRequestException(
          "Availability must be in the future",
        );
      }

      await this.ensureNoOverlap(
        slot.doctorId,
        availableDate,
        startTime,
        endTime,
        slot.id,
      );
    }

    slot.availableDate = availableDate;
    slot.startTime = startTime;
    slot.endTime = endTime;
    slot.status = status;

    return this.availabilityRepository.save(slot);
  }

  // Doctor: Delete own availability
  async remove(
    userId: string,
    id: string,
  ): Promise<{ message: string }> {
    const slot = await this.findOwnedSlot(userId, id);

    if (slot.status === DoctorAvailabilityStatus.TAKEN) {
      throw new ConflictException(
        "A booked slot cannot be deleted",
      );
    }

    await this.availabilityRepository.remove(slot);

    return {
      message: "Availability slot deleted",
    };
  }

  // Find active doctor using doctor profile ID
  private async findDoctor(id: string): Promise<DoctorProfile> {
    const doctor = await this.doctorsRepository
      .createQueryBuilder("doctor")
      .innerJoin(
        "users",
        "user",
        '"user"."id" = "doctor"."user_id" AND "user"."account_status" = :activeStatus',
        { activeStatus: "ACTIVE" },
      )
      .where('"doctor"."id" = :id', { id })
      .getOne();

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    return doctor;
  }

  // Find active doctor using logged-in user's ID
  private async findDoctorByUserId(
    userId: string,
  ): Promise<DoctorProfile> {
    const doctor = await this.doctorsRepository
      .createQueryBuilder("doctor")
      .innerJoin(
        "users",
        "user",
        '"user"."id" = "doctor"."user_id" AND "user"."account_status" = :activeStatus',
        { activeStatus: "ACTIVE" },
      )
      .where('"doctor"."user_id" = :userId', { userId })
      .getOne();

    if (!doctor) {
      throw new NotFoundException(
        "Active doctor profile not found",
      );
    }

    return doctor;
  }

  // Verify that the slot belongs to the logged-in doctor
  private async findOwnedSlot(
    userId: string,
    slotId: string,
  ): Promise<DoctorAvailability> {
    const doctor = await this.findDoctorByUserId(userId);
    const slot = await this.availabilityRepository.findOne({
      where: {
        id: slotId,
        doctorId: doctor.id,
      },
    });

    if (!slot) {
      throw new NotFoundException(
        "Availability slot not found",
      );
    }

    return slot;
  }

  // Check overlapping availability
  private async ensureNoOverlap(
    doctorId: string,
    availableDate: string,
    startTime: string,
    endTime: string,
    excludedSlotId?: string,
  ): Promise<void> {
    const queryBuilder = this.availabilityRepository
      .createQueryBuilder("slot")
      .where("slot.doctorId = :doctorId", { doctorId })
      .andWhere("slot.availableDate = :availableDate", {
        availableDate,
      })
      .andWhere("slot.status != :unavailable", {
        unavailable: DoctorAvailabilityStatus.UNAVAILABLE,
      })
      .andWhere(
        "slot.startTime < :endTime AND slot.endTime > :startTime",
        {
          startTime,
          endTime,
        },
      );

    if (excludedSlotId) {
      queryBuilder.andWhere("slot.id != :excludedSlotId", {
        excludedSlotId,
      });
    }

    if (await queryBuilder.getOne()) {
      throw new ConflictException(
        "This time overlaps another doctor slot",
      );
    }
  }

  // Check whether the date and time are in the future
  private isFutureOrCurrentDate(
    date: string,
    time: string,
  ): boolean {
    const now = new Date();

    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    if (date > today) return true;
    if (date < today) return false;

    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    return time > currentTime;
  }
}
