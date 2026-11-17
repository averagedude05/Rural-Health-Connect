import { Controller, Get, Param, ParseUUIDPipe, Query } from "@nestjs/common";
import { PatientsService } from "./patients.service";
import { SearchDoctorsDto } from "./dto/search-doctors.dto";
import { SearchDoctorAvailabilityDto } from "./dto/search-doctor-availability.dto";



@Controller("doctor")
export class DoctorsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  searchDoctors(@Query() search: SearchDoctorsDto) {
    return this.patientsService.searchDoctors(search);
  }
  @Get(":doctorId/availability")
searchAvailability(
  @Param("doctorId", new ParseUUIDPipe()) doctorId: string,
  @Query() search: SearchDoctorAvailabilityDto,
) {
  return this.patientsService.searchDoctorAvailability(doctorId, search);
}
}