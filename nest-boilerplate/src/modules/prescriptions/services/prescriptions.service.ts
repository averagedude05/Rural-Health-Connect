
import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  MedicalRecord,
  MedicalRecordAccessStatus,
} from "../entities/medical-record.entity";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { CreatePrescriptionDto } from "../dto/create-prescription.dto";

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private readonly medicalRecordRepository: Repository<MedicalRecord>,

    @InjectRepository(DoctorProfile)
    private readonly doctorRepository: Repository<DoctorProfile>,
  ) {}

  async create(
    userId: string,
    dto: CreatePrescriptionDto,
  ): Promise<MedicalRecord> {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    const medicalRecord = this.medicalRecordRepository.create({
      patientId: dto.patientId,
      doctor,
      clinicId: doctor.clinicId,
      visitDate: new Date().toISOString().slice(0, 10),
      notes: dto.diagnosis,
      accessStatus: MedicalRecordAccessStatus.PRIVATE,
      medicineDetails: dto.medicines,
      prescriptionInstructions: dto.advice ?? null,
      prescriptionCreatedAt: new Date(),
    });

    return this.medicalRecordRepository.save(medicalRecord);
  }

  async findMyPrescriptions(userId: string): Promise<MedicalRecord[]> {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    return this.medicalRecordRepository.find({
      where: { doctor: { id: doctor.id } },
      relations: ["doctor"],
      order: { prescriptionCreatedAt: "DESC" },
    });
  }

  async findOne(
    userId: string,
    prescriptionId: string,
  ): Promise<MedicalRecord> {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException("Doctor profile not found");
    }

    const medicalRecord = await this.medicalRecordRepository.findOne({
      where: {
        id: prescriptionId,
        doctor: { id: doctor.id },
      },
      relations: ["doctor"],
    });

    if (!medicalRecord) {
      throw new NotFoundException("Prescription not found");
    }

    return medicalRecord;
  }
}
