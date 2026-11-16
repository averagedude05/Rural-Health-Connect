import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { CreatePatientProfileDto } from "./dto/create-patient-profile.dto";
import { SearchClinicsDto } from "./dto/search-clinics.dto";
import { UpdatePatientProfileDto } from "./dto/update-patient-profile.dto";
import { Clinic } from "./entities/clinic.entity";
import { ClinicServiceEntity } from "./entities/clinic-service.entity";
import { DoctorProfileEntity } from "./entities/doctor-profile.entity";
import { PatientProfile } from "./entities/patient-profile.entity";
import { SearchDoctorsDto } from "./dto/search-doctors.dto";
import { SearchDoctorAvailabilityDto } from "./dto/search-doctor-availability.dto";
import { DoctorAvailabilityEntity } from "./entities/doctor-availability.entity";
import { CreateAppointmentDto } from "./dto/create-appointment.dto";
import { AppointmentEntity } from "./entities/appointment.entity";
import { UpdateAppointmentDto } from "./dto/update-appointment.dto";

@Injectable()
export class PatientsService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(PatientProfile)
    private readonly patientsRepository: Repository<PatientProfile>,

    @InjectRepository(Clinic)
    private readonly clinicsRepository: Repository<Clinic>,

    @InjectRepository(ClinicServiceEntity)
    private readonly clinicServicesRepository: Repository<ClinicServiceEntity>,

    @InjectRepository(DoctorProfileEntity)
    private readonly doctorsRepository: Repository<DoctorProfileEntity>,

    @InjectRepository(DoctorAvailabilityEntity)
    private readonly doctorAvailabilitiesRepository: Repository<DoctorAvailabilityEntity>,

    @InjectRepository(AppointmentEntity)
    private readonly appointmentsRepository: Repository<AppointmentEntity>,
  ) {}

  async searchClinics(search: SearchClinicsDto): Promise<Clinic[]> {
    const query = this.clinicsRepository
      .createQueryBuilder("clinic")
      .where("UPPER(clinic.status) = :clinicStatus", {
        clinicStatus: "ACTIVE",
      });

    if (search.name?.trim()) {
      query.andWhere("clinic.name ILIKE :name", {
        name: `%${search.name.trim()}%`,
      });
    }

    if (search.location?.trim()) {
      query.andWhere("clinic.location ILIKE :location", {
        location: `%${search.location.trim()}%`,
      });
    }

    if (search.service?.trim()) {
      query
        .innerJoin(
          ClinicServiceEntity,
          "clinicService",
          "clinicService.clinicId = clinic.id",
        )
        .andWhere(
          "UPPER(clinicService.availabilityStatus) = :serviceStatus",
          { serviceStatus: "AVAILABLE" },
        )
        .andWhere("clinicService.serviceName ILIKE :service", {
          service: `%${search.service.trim()}%`,
        });
    }

    return query.distinct(true).orderBy("clinic.name", "ASC").getMany();
  }

  async getClinicDetails(id: string) {
    const clinic = await this.clinicsRepository.findOne({
      where: { id, status: "ACTIVE" },
    });

    if (!clinic) {
      throw new NotFoundException("Clinic not found");
    }

    const [services, doctors] = await Promise.all([
      this.clinicServicesRepository.find({
        where: { clinicId: id, availabilityStatus: "AVAILABLE" },
        order: { serviceName: "ASC" },
      }),
      this.doctorsRepository.find({
        where: { clinicId: id },
        select: { id: true, name: true, specialization: true },
        order: { name: "ASC" },
      }),
    ]);

    return { ...clinic, services, doctors };
  }

  async createForUser(
    userId: string,
    createPatientProfileDto: CreatePatientProfileDto,
  ): Promise<PatientProfile> {
    const existingPatient = await this.patientsRepository.findOne({
      where: { userId },
    });

    if (existingPatient) {
      throw new ConflictException("Patient profile already exists");
    }

    const patient = this.patientsRepository.create({
      userId,
      name: createPatientProfileDto.name,
      dateOfBirth: createPatientProfileDto.dateOfBirth ?? null,
      address: createPatientProfileDto.address ?? null,
      emergencyContact: createPatientProfileDto.emergencyContact ?? null,
    });

    return this.patientsRepository.save(patient);
  }

  async findByUserId(userId: string): Promise<PatientProfile> {
    const patient = await this.patientsRepository.findOne({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException("Patient profile not found");
    }

    return patient;
  }

  async deleteProfileByUserId(userId: string): Promise<{ message: string }> {
    return this.dataSource.transaction(async (manager) => {
      const patientRepository = manager.getRepository(PatientProfile);
      const patient = await patientRepository.findOne({
        where: { userId },
        lock: { mode: "pessimistic_write" },
      });

      if (!patient) {
        throw new NotFoundException("Patient profile not found");
      }

      const appointmentCount = await manager
        .getRepository(AppointmentEntity)
        .count({ where: { patientId: patient.id } });

      if (appointmentCount > 0) {
        throw new ConflictException(
          "Patient profile cannot be deleted while appointment records exist",
        );
      }

      await patientRepository.remove(patient);
      return { message: "Patient profile deleted successfully" };
    });
  }

  async updateByUserId(
    userId: string,
    updatePatientProfileDto: UpdatePatientProfileDto,
  ): Promise<PatientProfile> {
    const patient = await this.findByUserId(userId);
    Object.assign(patient, updatePatientProfileDto);
    return this.patientsRepository.save(patient);
  }

  async searchDoctors(search: SearchDoctorsDto): Promise<DoctorProfileEntity[]> {
    const query = this.doctorsRepository
      .createQueryBuilder("doctor")
      .innerJoin(
        Clinic,
        "clinic",
        "clinic.id = doctor.clinicId AND UPPER(clinic.status) = :clinicStatus",
        { clinicStatus: "ACTIVE" },
      )
      .select(["doctor.id", "doctor.clinicId", "doctor.name", "doctor.specialization"]);

    if (search.clinicId) {
      query.andWhere("doctor.clinicId = :clinicId", {
        clinicId: search.clinicId,
      });
    }

    if (search.specialization?.trim()) {
      query.andWhere("doctor.specialization ILIKE :specialization", {
        specialization: "%" + search.specialization.trim() + "%",
      });
    }

    return query.orderBy("doctor.name", "ASC").getMany();
  }

  async searchDoctorAvailability(
    doctorId: string,
    search: SearchDoctorAvailabilityDto,
  ): Promise<DoctorAvailabilityEntity[]> {
    const query = this.doctorAvailabilitiesRepository
      .createQueryBuilder("availability")
      .where("availability.doctorId = :doctorId", { doctorId })
      .andWhere("availability.slotStatus = :status", { status: "AVAILABLE" });

    if (search.date) {
      query.andWhere("availability.availableDate = :date", {
        date: search.date,
      });
    }

    return query
      .orderBy("availability.availableDate", "ASC")
      .addOrderBy("availability.startTime", "ASC")
      .getMany();
  }

  async bookAppointment(
  userId: string,
  dto: CreateAppointmentDto,
): Promise<AppointmentEntity> {
  return this.dataSource.transaction(async (manager) => {
    const patient = await manager.getRepository(PatientProfile).findOne({
      where: { userId },
    });

    if (!patient) {
      throw new NotFoundException("Patient profile not found");
    }

    const doctor = await manager
      .getRepository(DoctorProfileEntity)
      .findOne({ where: { id: dto.doctorId } });

    if (!doctor || doctor.clinicId !== dto.clinicId) {
      throw new NotFoundException("Doctor not found at this clinic");
    }

    const appointmentDate = dto.appointmentTime.slice(0, 10);
    const appointmentStartTime = dto.appointmentTime.slice(11, 19);

    const availabilityRepository =
      manager.getRepository(DoctorAvailabilityEntity);

    const slot = await availabilityRepository.findOne({
      where: {
        doctorId: dto.doctorId,
        availableDate: appointmentDate,
        startTime: appointmentStartTime,
        slotStatus: "AVAILABLE",
      },
      lock: { mode: "pessimistic_write" },
    });

    if (!slot) {
      throw new ConflictException("This appointment slot is not available");
    }

    const clinic = await manager.getRepository(Clinic).findOne({
      where: { id: dto.clinicId, status: "ACTIVE" },
    });

    if (!clinic) {
      throw new NotFoundException("Clinic not found");
    }

    slot.slotStatus = "TAKEN";
    await availabilityRepository.save(slot);

    const appointmentRepository = manager.getRepository(AppointmentEntity);
    const appointment = appointmentRepository.create({
      patientId: patient.id,
      doctorId: dto.doctorId,
      clinicId: dto.clinicId,
      appointmentType: dto.appointmentType,
      appointmentTime: new Date(dto.appointmentTime),
      status: "BOOKED",
    });

    return appointmentRepository.save(appointment);
    });
  }

  async getAppointmentsByUserId(userId: string): Promise<AppointmentEntity[]> {
  const patient = await this.findByUserId(userId);

  return this.appointmentsRepository.find({
    where: { patientId: patient.id },
    order: { appointmentTime: "DESC" },
  });
 }

  async updateAppointment(
    userId: string,
    appointmentId: string,
    dto: UpdateAppointmentDto,
  ): Promise<AppointmentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const patient = await manager.getRepository(PatientProfile).findOne({ where: { userId } });
      if (!patient) throw new NotFoundException("Patient profile not found");

      const appointmentRepository = manager.getRepository(AppointmentEntity);
      const appointment = await appointmentRepository.findOne({
        where: { id: appointmentId, patientId: patient.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!appointment) throw new NotFoundException("Appointment not found");
      if (appointment.status !== "BOOKED") {
        throw new ConflictException("Only booked appointments can be updated");
      }

      if (dto.appointmentTime) {
        const oldParts = this.getAppointmentSlotParts(appointment.appointmentTime);
        const date = dto.appointmentTime.slice(0, 10);
        const time = dto.appointmentTime.slice(11, 19);
        if (date !== oldParts.date || time !== oldParts.time) {
          const availabilityRepository = manager.getRepository(DoctorAvailabilityEntity);
          const nextSlot = await availabilityRepository.findOne({
            where: { doctorId: appointment.doctorId, availableDate: date, startTime: time, slotStatus: "AVAILABLE" },
            lock: { mode: "pessimistic_write" },
          });
          if (!nextSlot) throw new ConflictException("Requested slot is not available");

          const oldSlot = await availabilityRepository.findOne({
            where: { doctorId: appointment.doctorId, availableDate: oldParts.date, startTime: oldParts.time, slotStatus: "TAKEN" },
            lock: { mode: "pessimistic_write" },
          });
          if (oldSlot) {
            oldSlot.slotStatus = "AVAILABLE";
            await availabilityRepository.save(oldSlot);
          }
          nextSlot.slotStatus = "TAKEN";
          await availabilityRepository.save(nextSlot);
          appointment.appointmentTime = new Date(dto.appointmentTime);
        }
      }

      if (dto.appointmentType) appointment.appointmentType = dto.appointmentType;
      return appointmentRepository.save(appointment);
    });
  }

  async cancelAppointment(userId: string, appointmentId: string): Promise<AppointmentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const patient = await manager.getRepository(PatientProfile).findOne({ where: { userId } });
      if (!patient) throw new NotFoundException("Patient profile not found");

      const appointmentRepository = manager.getRepository(AppointmentEntity);
      const appointment = await appointmentRepository.findOne({
        where: { id: appointmentId, patientId: patient.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!appointment) throw new NotFoundException("Appointment not found");
      if (appointment.status !== "BOOKED") {
        throw new ConflictException("Only booked appointments can be cancelled");
      }

      const parts = this.getAppointmentSlotParts(appointment.appointmentTime);
      const availabilityRepository = manager.getRepository(DoctorAvailabilityEntity);
      const slot = await availabilityRepository.findOne({
        where: { doctorId: appointment.doctorId, availableDate: parts.date, startTime: parts.time, slotStatus: "TAKEN" },
        lock: { mode: "pessimistic_write" },
      });
      if (slot) {
        slot.slotStatus = "AVAILABLE";
        await availabilityRepository.save(slot);
      }

      appointment.status = "CANCELLED";
      return appointmentRepository.save(appointment);
    });
  }

  private getAppointmentSlotParts(value: Date): { date: string; time: string } {
    const pad = (number: number) => String(number).padStart(2, "0");
    return {
      date: `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`,
      time: `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`,
    };
  }

  async getDashboardByUserId(userId: string) {
  const patient = await this.findByUserId(userId);

  const appointments = await this.appointmentsRepository.find({
    where: { patientId: patient.id },
    order: { appointmentTime: "DESC" },
  });

  return {
      patient,
      appointments,
    };
  }
}
