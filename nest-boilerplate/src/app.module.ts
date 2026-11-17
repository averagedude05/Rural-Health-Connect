
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { BullModule } from "@nestjs/bull";
import { DoctorsModule } from "@/modules/doctors/doctors.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { PrescriptionsModule } from "@/modules/prescriptions/prescriptions.module";
import { LabRequestsModule } from "@/modules/lab-requests/lab-requests.module";

@Module({
  imports: [
    PostgresDatabaseProviderModule,
    AuthModule,
    DoctorsModule,
    PrescriptionsModule,
    LabRequestsModule,

    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
