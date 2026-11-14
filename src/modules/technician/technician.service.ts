import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TechnicianProfile } from "./entities/technician.entity";
import { User } from "../user/entities/user.entity";
import { Clinic } from "../clinic/entities/clinic.entity";
import { CreateTechnicianDto, UpdateTechnicianDto } from "./dto/technician.dto";

@Injectable()
export class TechnicianService {
    constructor(
        @InjectRepository(TechnicianProfile) private readonly technicianRepository: Repository<TechnicianProfile>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Clinic) private readonly clinicRepository: Repository<Clinic>,
    ) {}

    async getAllTechnician() {
        const technicians = await this.technicianRepository.find();
        if (!technicians) {
            throw new NotFoundException("No technicians found");
        }
        return technicians;
    }

    async getTechnician(id: string) {
        try {
            const technician = await this.technicianRepository.findOne({ where: { id: id } });
            if (!technician) {
                throw new NotFoundException("Technician not found");
            }
            return technician;
        }
        catch (error) {
            throw error;
        }
    }

    async createTechnician(dto: CreateTechnicianDto, userId: string) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new NotFoundException("User not found");
            }

            const clinic = await this.clinicRepository.findOne({ where: { id: dto.clinic_id } });
            if (!clinic) {
                throw new NotFoundException("Clinic not found");
            }

            const responce = this.technicianRepository.create({
                ...dto,
                user_id:userId,
            });
            return await this.technicianRepository.save(responce);
        }
        catch (error) {
            throw error;
        }
    }

    async updateTechnician(id: string, dto: UpdateTechnicianDto) {
        try {
            if (!id) {
                throw new NotFoundException("Technician not found");
            }
            const technician = await this.technicianRepository.findOne({ where: { id: id } });
            if (!technician) {
                throw new NotFoundException("Technician not found");
            }
            return await this.technicianRepository.update({ id: id }, dto);
        }
        catch (error) {
            throw error;
        }
    }

    async deleteTechnician(id: string) {
        try {
            const technician = await this.technicianRepository.findOne({ where: { id: id } });
            if (!technician) {
                throw new NotFoundException("Technician not found");
            }
            return await this.technicianRepository.delete({ id: id });
        }
        catch (error) {
            throw error;
        }
    }

}