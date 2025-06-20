import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { Doctor } from './entities/doctor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('api/v1/doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorController {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  @Get('profile')
  @Roles(UserRole.DOCTOR)
  async getProfile(@Req() req) {
    const doctor = await this.doctorRepository.findOne({ where: { user: { id: req.user.userId } }, relations: ['user'] });
    return doctor;
  }
} 