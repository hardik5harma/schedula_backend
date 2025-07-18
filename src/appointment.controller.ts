import { Controller, Post, Body, UseGuards, Req, UsePipes, ValidationPipe, Get } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { AppointmentService } from './appointment.service';

@Controller('api/v1/appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async bookAppointment(@Body() dto: BookAppointmentDto, @Req() req) {
    return this.appointmentService.bookAppointment(dto, req.user.userId);
  }

  @Get('view-appointments')
  async viewAppointments(@Req() req) {
    const user = req.user;
    if (user.role === 'patient') {
      return this.appointmentService.getUpcomingAppointmentsForPatient(user.userId);
    } else if (user.role === 'doctor') {
      return this.appointmentService.getUpcomingAppointmentsForDoctor(user.userId);
    } else {
      return { message: 'Role not supported' };
    }
  }
} 