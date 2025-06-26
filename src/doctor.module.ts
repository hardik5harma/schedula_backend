import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';
import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, DoctorAvailability, DoctorTimeSlot])],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {} 