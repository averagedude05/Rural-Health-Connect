import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

@Injectable()
export class DevAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createPatientTestToken() {
    if (process.env.NODE_ENV !== "development") {
      throw new ForbiddenException("Dummy login is only available in development");
    }

    const phone = "POSTMAN-TEST-0001";

    const userId = await this.dataSource.transaction(async (manager) => {
      const existingUsers = await manager.query(
        "SELECT id, role FROM users WHERE phone = $1 LIMIT 1",
        [phone],
      );

      let id: string;

      if (existingUsers.length > 0) {
        if (existingUsers[0].role !== "ROLE_PATIENT") {
          throw new ConflictException("Test phone is already used by another role");
        }
        id = String(existingUsers[0].id);
      } else {
        const createdUsers = await manager.query(
          `INSERT INTO users (role, phone, password_hash, account_status)
           VALUES ($1, $2, $3, $4)
           RETURNING id`,
          ["ROLE_PATIENT", phone, "DUMMY_LOGIN_DISABLED", "ACTIVE"],
        );
        id = String(createdUsers[0].id);
      }

      await manager.query(
        `INSERT INTO patient_profiles
           (user_id, name, date_of_birth, address, emergency_contact)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO NOTHING`,
        [id, "Postman Test Patient", "2000-01-01", "Test Address", "0000000000"],
      );

      return id;
    });

    const accessToken = this.jwtService.sign({
      id: userId,
      roles: ["ROLE_PATIENT"],
    });

    return {
      tokenType: "Bearer",
      accessToken,
      userId,
      expiresIn: "15m",
    };
  }
}