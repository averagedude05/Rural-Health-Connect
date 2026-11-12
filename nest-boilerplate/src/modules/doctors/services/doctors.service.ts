import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { CreateDoctorDto } from "../dto/create-doctor.dto";
import { FindDoctorsQueryDto } from "../dto/find-doctors.query.dto";
import { UpdateDoctorDto } from "../dto/update-doctor.dto";
import { VerifyDoctorDto } from "../dto/verify-doctor.dto";
import { DoctorProfile } from "../entities/doctor-profile.entity";

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorsRepository: Repository<DoctorProfile>,
  ) {}

  async create(dto: CreateDoctorDto): Promise<DoctorProfile> {
    const existingDoctor = await this.doctorsRepository.findOne({
      where: { userId: dto.userId },
    });

    if (existingDoctor) {
      throw new ConflictException("A doctor profile already exists for this user");
    }

    const doctor = this.doctorsRepository.create(dto);
    return this.doctorsRepository.save(doctor);
  }

  findAll(query: FindDoctorsQueryDto): Promise<DoctorProfile[]> {
    const where: {
      clinicId?: number;
      specialization?: ReturnType<typeof ILike>;
      isActive: boolean;
    } = { isActive: true };

    if (query.clinicId) where.clinicId = query.clinicId;
    if (query.specialization) {
      where.specialization = ILike(`%${query.specialization}%`);
    }

    return this.doctorsRepository.find({
      where,
      order: { fullName: "ASC" },
    });
  }

  async findOne(id: number): Promise<DoctorProfile> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!doctor) throw new NotFoundException("Doctor not found");
    return doctor;
  }

  async update(id: number, dto: UpdateDoctorDto): Promise<DoctorProfile> {
    const doctor = await this.findOne(id);
    Object.assign(doctor, dto);
    return this.doctorsRepository.save(doctor);
  }

  async updateVerification(
    id: number,
    dto: VerifyDoctorDto,
  ): Promise<DoctorProfile> {
    const doctor = await this.findOne(id);
    doctor.verificationStatus = dto.verificationStatus;
    return this.doctorsRepository.save(doctor);
  }

  async deactivate(id: number): Promise<{ message: string }> {
    const doctor = await this.findOne(id);
    doctor.isActive = false;
    await this.doctorsRepository.save(doctor);
    return { message: "Doctor profile deactivated" };
  }
}
