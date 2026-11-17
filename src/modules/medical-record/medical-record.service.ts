import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MedicalRecord } from "./entities/medical-record.entity";
import { PatientProfile } from "@/modules/patients/entities/patient-profile.entity";
import { DoctorProfile } from "@/modules/doctors/entities/doctor-profile.entity";
import { Clinic } from "@/modules/patients/entities/clinic.entity";
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from "./dto/medical-record.dto";



@Injectable()
export class MedicalRecordService {
    constructor(
        @InjectRepository(MedicalRecord) private readonly medicalRecordRepository: Repository<MedicalRecord>,
        @InjectRepository(PatientProfile) private readonly patientRepository: Repository<PatientProfile>,
        @InjectRepository(DoctorProfile) private readonly doctorRepository: Repository<DoctorProfile>,
        @InjectRepository(Clinic) private readonly clinicRepository: Repository<Clinic>,
    ) {}

    async getAllRecords() {
        try {
            const record= await this.medicalRecordRepository.find({ where:{access_status:"SHARED"} });
            return record;
        }
        catch (error) {
            throw error;
        }
    }

    async getRecord(id: string) {
        try {
            const record = await this.medicalRecordRepository.findOne({ where: { id:id,access_status:"SHARED"} });
            if (!record) {
                throw new NotFoundException("Medical record not found");
            }
            return record;
        }
        catch (error) {
            throw error;
        }
    }

    async getRecordPatient(patient_id:string){
        try{
            const patient= await this.patientRepository.findOne({ where: { id:patient_id } });
            if(!patient){
                throw new NotFoundException("Patient not found");
            }
            const record= await this.medicalRecordRepository.find({ where: { patient_id:patient_id, access_status:"SHARED" } })
            return record;
        }
        catch(error){
            throw error;
        }
    }

    async createRecord(dto: CreateMedicalRecordDto) {
        try {
            const patient = await this.patientRepository.findOne({ where: { id: dto.patient_id } });
            if (!patient) {
                throw new NotFoundException("Patient not found");
            }

            const doctor = await this.doctorRepository.findOne({ where: { id: dto.doctor_id } });
            if (!doctor) {
                throw new NotFoundException("Doctor not found");
            }

            const clinic = await this.clinicRepository.findOne({ where: { id: dto.clinic_id } });
            if (!clinic) {
                throw new NotFoundException("Clinic not found");
            }

            const record = this.medicalRecordRepository.create(dto);
            return await this.medicalRecordRepository.save(record);
        }
        catch (error) {
            throw error;
        }
    }

    async updateRecord(id: string, dto: UpdateMedicalRecordDto) {
        try {
            const record = await this.medicalRecordRepository.findOne({ where: { id:id } });
            if (!record) {
                throw new NotFoundException("Medical record not found");
            }
            return await this.medicalRecordRepository.update({ id:id }, dto);
        }
        catch (error) {
            throw error;
        }
    }

    async deleteRecord(id: string) {
        try {
            const record = await this.medicalRecordRepository.findOne({ where: { id:id } });
            if (!record) {
                throw new NotFoundException("Medical record not found");
            }
            return await this.medicalRecordRepository.delete({id:id});
        }
        catch (error) {
            throw error;
        }
    }
}
