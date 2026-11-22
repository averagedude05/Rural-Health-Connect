import { Injectable, NotFoundException, Req } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TechnicianProfile } from "./entities/technician.entity";
 import { Clinic } from "@/modules/clinic/entities/clinic.entity";
import { CreateTechnicianDto, UpdateTechnicianDto } from "./dto/technician.dto";
import argon2 from "argon2";
import { User } from "@/modules/users/entities/user.entity";
import { CreateUserDto } from "@/modules/users/dto/user.dto";
import { Role } from "@/src/common/enums/role.enum";
import { LabRequest } from "../lab-request/entities/lab-request.entity";

@Injectable()
export class TechnicianService {
    constructor(
        @InjectRepository(TechnicianProfile) private readonly technicianRepository: Repository<TechnicianProfile>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Clinic) private readonly clinicRepository: Repository<Clinic>
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
            if(user.role !== Role.LAB_TECHNICIAN){
                throw new NotFoundException("User not a lab technician");
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
