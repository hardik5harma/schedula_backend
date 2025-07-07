import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { Patient } from './entities/patient.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('api/v1/patient')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  @Get('profile')
  @Roles(UserRole.PATIENT)
  async getProfile(@Req() req) {
    const patient = await this.patientRepository.findOne({ where: { user: { id: req.user.userId } }, relations: ['user'] });
    if (!patient) return { message: 'Patient not found' };
    return {
      patient_id: patient.patient_id,
      user_id: patient.user?.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      phone_number: patient.phone_number,
      gender: patient.gender,
      dob: patient.dob,
      address: patient.address,
      emergency_contact: patient.emergency_contact,
      medical_history: patient.medical_history,
      created_at: patient.created_at,
      user: patient.user, // full user object if needed
    };
  }
} 