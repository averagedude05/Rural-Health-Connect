
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { FindDoctorsQueryDto } from "../dto/find-doctors.query.dto";
import { UpdateDoctorAccountStatusDto } from "../dto/update-doctor-account-status.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { DoctorProfile } from "../entities/doctor-profile.entity";

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorsRepository: Repository<DoctorProfile>,
  ) {}

  async create(dto: CreateDoctorDto): Promise<DoctorProfile> {
    await this.ensureDoctorUser(dto.userId);
    await this.ensureClinic(dto.clinicId);

    const existingDoctor = await this.doctorsRepository.findOne({
      where: { userId: dto.userId },
    });

    if (existingDoctor) {
      throw new ConflictException(
        "A doctor profile already exists for this user",
      );
    }

    const doctor = this.doctorsRepository.create(dto);
    return this.doctorsRepository.save(doctor);
  }

  findAll(query: FindDoctorsQueryDto): Promise<DoctorProfile[]> {
    const queryBuilder = this.doctorsRepository
      .createQueryBuilder("doctor")
      .innerJoin("users", "user", '"user"."id" = "doctor"."user_id"');

    if (query.clinicId) {
      queryBuilder.andWhere('"doctor"."clinic_id" = :clinicId', {
        clinicId: query.clinicId,
      });
    }

    if (query.specialization) {
      queryBuilder.andWhere(
        '"doctor"."specialization" ILIKE :specialization',
        {
          specialization: `%${query.specialization}%`,
        },
      );
    }

    return queryBuilder.orderBy('"doctor"."name"', "ASC").getMany();
  }

  async findOne(id: string): Promise<DoctorProfile> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor not found");
    }

    return doctor;
  }

  async update(
    id: string,
    dto: UpdateDoctorDto,
  ): Promise<DoctorProfile> {
    const doctor = await this.findOne(id);

    Object.assign(doctor, dto);

    return this.doctorsRepository.save(doctor);
  }

  async updateAccountStatus(
    id: string,
    dto: UpdateDoctorAccountStatusDto,
  ): Promise<DoctorProfile & { accountStatus: string }> {
    const doctor = await this.findOne(id);

    const users = (await this.doctorsRepository.manager.query(
      `UPDATE "users"
       SET "account_status" = $1
       WHERE "id" = $2
       RETURNING "account_status"`,
      [dto.accountStatus, doctor.userId],
    )) as Array<{ account_status: string }>;

    if (users.length === 0) {
      throw new NotFoundException("Doctor user account not found");
    }

    return {
      ...doctor,
      accountStatus: users[0].account_status,
    };
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const doctor = await this.findOne(id);

    await this.doctorsRepository.manager.query(
      `UPDATE "users" SET "account_status" = $1 WHERE "id" = $2`,
      ["SUSPENDED", doctor.userId],
    );

    return {
      message: "Doctor profile deactivated",
    };
  }

  // Doctor Dashboard: Find own profile
  async findMyProfile(userId: string): Promise<DoctorProfile> {
    const doctor = await this.doctorsRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    return doctor;
  }

  // Doctor Dashboard: Update own profile
  async updateMyProfile(
    userId: string,
    dto: UpdateDoctorDto,
  ): Promise<DoctorProfile> {
    const doctor = await this.findMyProfile(userId);

    Object.assign(doctor, dto);

    return this.doctorsRepository.save(doctor);
  }

  private async ensureDoctorUser(userId: string): Promise<void> {
    const users = (await this.doctorsRepository.manager.query(
      `SELECT "role" FROM "users" WHERE "id" = $1`,
      [userId],
    )) as Array<{ role: string }>;

    if (users.length === 0) {
      throw new NotFoundException("User account not found");
    }

    if (users[0].role.toUpperCase() !== "DOCTOR") {
      throw new BadRequestException(
        "The selected user account is not a doctor",
      );
    }
  }

  private async ensureClinic(clinicId: string): Promise<void> {
    const clinics = (await this.doctorsRepository.manager.query(
      `SELECT "id" FROM "clinics" WHERE "id" = $1`,
      [clinicId],
    )) as Array<{ id: string }>;

    if (clinics.length === 0) {
      throw new NotFoundException("Clinic not found");
    }
  }
}
