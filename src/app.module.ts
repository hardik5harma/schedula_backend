import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { Appointment } from './entities/appointment.entity';
import { AuthModule } from './auth/auth.module';
import { DoctorController } from './doctor.controller';
import { PatientController } from './patient.controller';
import { User } from './entities/user.entity';
import { DoctorModule } from './doctor.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Doctor, Patient, TimeSlot, Appointment],
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([User, Patient, TimeSlot, Appointment]),
    AuthModule,
    DoctorModule,
  ],
  controllers: [AppController, PatientController],
  providers: [AppService],
})
export class AppModule {}
