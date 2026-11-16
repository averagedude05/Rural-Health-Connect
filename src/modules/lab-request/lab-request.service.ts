import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { LabRequest } from "./entities/lab-request.entity";
import { ForbiddenException, Injectable, NotFoundException, Param } from "@nestjs/common";
import { PatientProfile } from "@/modules/patient/entities/patient.entity";
import { DoctorProfile } from "@/modules/doctor/entities/doctor.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
import { CreateLabRequestDto, UpdateLabRequestDto } from "./dto/lab-request.dto";
import { Role } from "@/src/common/enums/role.enum";






@Injectable()
export class LabRequestService{
    constructor(
    @InjectRepository(LabRequest) private readonly labrequestRepository:Repository<LabRequest>,
    @InjectRepository(PatientProfile) private readonly patientRepository:Repository<PatientProfile>,
    @InjectRepository(DoctorProfile) private readonly doctorRepository: Repository<DoctorProfile>,
    @InjectRepository(TechnicianProfile) private readonly technicianRepository: Repository<TechnicianProfile>
){}

async getAllRequests(){
    try{
        const allrequests=await this.labrequestRepository.find()
        return allrequests;
    }
    catch(error){
        throw error;
    }
}


async getLabRequest( id:string){
    try{
        const requests= await this.labrequestRepository.findOne({where: { id: id }});
        if(!requests){
            throw new NotFoundException("Request not found");
        }
        return requests;
    }
    catch(error){
        throw error;
    }
    
}

async createLabRequest(dto:CreateLabRequestDto, doctorId:string){
    try{
    const patient = await this.patientRepository.findOne({ where: { id: dto.patient_id } });
    if(!patient){
        throw new NotFoundException("Patient not found");
    }
    const doctor=await this.doctorRepository.findOne({ where:{id:doctorId}})
    if(!doctor){
        throw new NotFoundException("Doctor not found");
    }
    const responce=this.labrequestRepository.create({
        patient_id: dto.patient_id,//left side entity er now(new) record of labrequest and the right one is the one found from the db 
        doctor_id:doctorId,
        test_name:dto.test_name
    })
    return await this.labrequestRepository.save(responce);
    }
    catch(error){
        throw error;
    }
    }
    async updateLabRequest(id: string, dto: UpdateLabRequestDto, reqid: string, roles: Role[]){
        try{
            const updateLabRequest = await this.labrequestRepository.findOne({ where: { id:id } });
            if (!updateLabRequest) {
                throw new NotFoundException("Lab request with ID not found");
            }
            if (roles.includes(Role.DOCTOR)) {
                if ( updateLabRequest.doctor_id !== reqid) {
                    throw new ForbiddenException("Cancel only created request");
                }
                if (dto.status !== "CANCELLED") {
                    throw new ForbiddenException("Only cancel is allowed");
                }
            }
            else if (roles.includes(Role.CLINIC_ADMIN) || roles.includes(Role.LAB_TECHNICIAN)) {
                if (dto.status === "CANCELLED") {
                    throw new ForbiddenException("Only doctors can cancel");
                }
            }
            if(dto.technician_id){
                const technician = await this.technicianRepository.findOne({where: { id: dto.technician_id }});
                if(!technician){
                throw new NotFoundException("Techinician not found");
            }
            }
            return await this.labrequestRepository.update({ id:id },dto);
        }
        catch(error){
            throw error;
        }
    }

    async deleteRequest(id:string){
        try{
            const updateLabRequest = await this.labrequestRepository.findOne({ where: { id:id } });
            if (!updateLabRequest) {
                throw new NotFoundException("Lab request with ID not found");
            }
            return await this.labrequestRepository.delete({id:id});
        }
        catch(error){
            throw error;
        }

    }

}




