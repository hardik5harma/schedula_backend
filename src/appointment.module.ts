import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient, DoctorTimeSlot])],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {} 