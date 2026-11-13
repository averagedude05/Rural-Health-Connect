import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { LabRequest } from "./entities/lab-request.entity";
import { Injectable, NotFoundException, Param } from "@nestjs/common";
import { PatientProfile } from "@/modules/patient/entities/patient.entity";
import { DoctorProfile } from "@/modules/doctor/entities/doctor.entity";
import { TechnicianProfile } from "@/modules/technician/entities/technician.entity";
import { CreateLabRequestDto, UpdateLabRequestDto } from "./dto/lab-request.dto";




@Injectable()
export class labrequestService{
    constructor(
    @InjectRepository(LabRequest) private readonly labrequestRepository:Repository<LabRequest>,
    @InjectRepository(PatientProfile) private readonly patientRepository:Repository<PatientProfile>,
    @InjectRepository(DoctorProfile) private readonly doctorRepository: Repository<DoctorProfile>,
    @InjectRepository(TechnicianProfile) private readonly technicianRepository: Repository<TechnicianProfile>
){}

async getAllRequests(){
    try{
        const allrequests=await this.labrequestRepository.find({relations:{patient:true,doctor:true, technician:true}})
        return allrequests;
    }
    catch(error){
        throw error;
    }
}


async getLabRequest( id:string){
    try{
        const requests=this.labrequestRepository.findOne({where: { id: id },relations: { patient: true, doctor: true, technician: true }});
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
        patient:patient,//left side entity er this record of labrequest and the right one is the one found from the db 
        doctor:doctor,
        test_name:dto.test_name
    })
    return await this.labrequestRepository.save(responce);
    }
    catch(error){
        throw error;
    }
    }
    async updateLabRequest(id: string, dto: UpdateLabRequestDto){
        try{
            const updateData: any = {};
            const updateLabRequest = await this.labrequestRepository.findOne({ where: { id:id } });
            if (!updateLabRequest) {
                throw new NotFoundException("Lab request with ID not found");
            }
            if(dto.technician_id){
                const technician = await this.technicianRepository.findOne({where: { id: dto.technician_id }});
                if(!technician){
                throw new NotFoundException("Techinician not found");
            }
                updateData.technician = technician;
            }
            if(dto.status){
                 updateData.status = dto.status;
            }
           // const {requested_at, ...rest}=updateLabRequest;
            return await this.labrequestRepository.update({id:id},updateData);
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




