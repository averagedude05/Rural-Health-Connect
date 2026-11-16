import { Controller, Post } from "@nestjs/common";
import { DevAuthService } from "./dev-auth.service";

@Controller("dev-auth")
export class DevAuthController {
  constructor(private readonly devAuthService: DevAuthService) {}

  @Post("patient-token")
  createPatientTestToken() {
    return this.devAuthService.createPatientTestToken();
  }
}