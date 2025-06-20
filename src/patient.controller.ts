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
    return patient;
  }
} 