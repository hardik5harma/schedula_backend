import { Controller, Get, Req, UseGuards, Query, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { DoctorService } from './doctor.service';

@Controller('api/v1/doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  findAll(@Query('name') name?: string, @Query('specialization') specialization?: string) {
    return this.doctorService.findAll(name, specialization);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async getProfile(@Req() req) {
    // req.user is populated by JwtAuthGuard with { userId: number, email: string, role: UserRole }
    return this.doctorService.findByUserId(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.findOne(id);
  }
} 