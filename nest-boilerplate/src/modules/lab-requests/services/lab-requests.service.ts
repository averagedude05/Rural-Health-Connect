
import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { LabRequest } from "../entities/lab-request.entity";
import { LabRequestStatus } from "../entities/lab-request.entity";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { CreateLabRequestDto } from "../dto/create-lab-request.dto";

@Injectable()
export class LabRequestsService {
  constructor(
    @InjectRepository(LabRequest)
    private readonly labRequestRepository: Repository<LabRequest>,

    @InjectRepository(DoctorProfile)
    private readonly doctorRepository: Repository<DoctorProfile>,
  ) {}

  async create(
    userId: string,
    dto: CreateLabRequestDto,
  ): Promise<LabRequest> {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    const labRequest = this.labRequestRepository.create({
      patientId: dto.patientId,
      doctor,
      testName: dto.testName,
      status: LabRequestStatus.REQUESTED,
      technicianId: null,
      filePath: null,
      resultUploadedAt: null,
    });

    return this.labRequestRepository.save(labRequest);
  }

  async findMyRequests(userId: string): Promise<LabRequest[]> {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    return this.labRequestRepository.find({
      where: { doctor: { id: doctor.id } },
      relations: ["doctor"],
      order: { requestedAt: "DESC" },
    });
  }

  async findOne(
    userId: string,
    requestId: string,
  ): Promise<LabRequest> {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    const labRequest = await this.labRequestRepository.findOne({
      where: {
        id: requestId,
        doctor: { id: doctor.id },
      },
      relations: ["doctor"],
    });

    if (!labRequest) {
      throw new NotFoundException("Lab request not found");
    }

    return labRequest;
  }
}
