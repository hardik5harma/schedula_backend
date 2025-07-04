import { Controller, Get, Req, UseGuards, Query, Param, ParseIntPipe, Body, Post, Patch, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { DoctorService } from './doctor.service';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { GetDoctorAvailabilityDto } from './dto/get-doctor-availability.dto';
import { UpdateScheduleTypeDto } from './dto/update-schedule-type.dto';
import { CreateDoctorSlotDto } from './dto/create-doctor-slot.dto';
import { UpdateDoctorSlotDto } from './dto/update-doctor-slot.dto';

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

  @Post(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async setAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDoctorAvailabilityDto,
    @Req() req
  ) {
    // Optionally, check req.user.sub === id for self-service
    return this.doctorService.createAvailability(id, dto);
  }

  @Get(':id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  async getAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: GetDoctorAvailabilityDto
  ) {
    return this.doctorService.getAvailableSlots(id, query);
  }

  @Patch(':id/schedule_Type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateScheduleType(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateScheduleTypeDto,
    @Req() req
  ) {
    // Only allow doctor to update their own schedule_Type
    return this.doctorService.updateScheduleType(id, dto.schedule_Type, req.user);
  }

  @Post(':id/slots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addSlot(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateDoctorSlotDto,
    @Req() req
  ) {
    return this.doctorService.addSlot(id, dto, req.user);
  }

  @Patch(':doctorId/slots/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async editSlot(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Body() dto: UpdateDoctorSlotDto,
    @Req() req
  ) {
    return this.doctorService.editSlot(doctorId, slotId, dto, req.user);
  }

  @Delete(':doctorId/slots/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async deleteSlot(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
    @Req() req
  ) {
    return this.doctorService.deleteSlot(doctorId, slotId, req.user);
  }
} 