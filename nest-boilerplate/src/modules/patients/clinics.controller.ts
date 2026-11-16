import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
} from "@nestjs/common";

import { SearchClinicsDto } from "./dto/search-clinics.dto";
import { PatientsService } from "./patients.service";

@Controller("clinics")
export class ClinicsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  searchClinics(@Query() search: SearchClinicsDto) {
    return this.patientsService.searchClinics(search);
  }

  @Get(":id")
  getClinicDetails(@Param("id", ParseUUIDPipe) id: string) {
    return this.patientsService.getClinicDetails(id);
  }
}
