import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { FindOptionsWhere, ILike, Repository, MoreThanOrEqual } from 'typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';
import { CreateDoctorAvailabilityDto } from './dto/create-doctor-availability.dto';
import { GetDoctorAvailabilityDto } from './dto/get-doctor-availability.dto';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(DoctorAvailability)
    private doctorAvailabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(DoctorTimeSlot)
    private doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
  ) {}

  async findAll(name?: string, specialization?: string): Promise<Doctor[]> {
    const where: FindOptionsWhere<Doctor> = {};

    if (specialization) {
      where.specialization = ILike(`%${specialization}%`);
    }

    if (name) {
      const nameQuery = [
        { ...where, first_name: ILike(`%${name}%`) },
        { ...where, last_name: ILike(`%${name}%`) },
      ];
      return this.doctorRepository.find({ where: nameQuery });
    }

    return this.doctorRepository.find({ where });
  }

  async findOne(id: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async findByUserId(userId: number): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { user: { id: userId } }, relations: ['user'] });
    if (!doctor) {
      throw new NotFoundException(`Doctor for user ID ${userId} not found`);
    }
    return doctor;
  }

  /**
   * Create doctor availability and generate slots
   */
  async createAvailability(doctorId: number, dto: CreateDoctorAvailabilityDto) {
    // Validate date is not in the past
    const today = new Date();
    const inputDate = new Date(dto.date);
    today.setHours(0,0,0,0);
    if (inputDate < today) {
      throw new Error('Date cannot be in the past');
    }

    // Prevent duplicate availability for same doctor/date/session
    const existing = await this.doctorAvailabilityRepository.findOne({
      where: { doctor: { doctor_id: doctorId }, date: dto.date, session: dto.session },
      relations: ['doctor'],
    });
    if (existing) {
      throw new Error('Availability for this date and session already exists');
    }

    // Fetch doctor to check schedule type and slot duration
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId } });
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }
    let slotDuration = dto.slot_duration || 30;
    if (doctor.schedule_Type === 'stream') {
      if (!doctor.slot_duration) {
        throw new Error('Doctor preferred slot duration not set');
      }
      slotDuration = doctor.slot_duration;
    }

    // Save availability
    const availability = this.doctorAvailabilityRepository.create({
      doctor: { doctor_id: doctorId } as any,
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      weekdays: dto.weekdays,
      session: dto.session,
    });
    const savedAvailability = await this.doctorAvailabilityRepository.save(availability);

    // Divide interval into slots
    const slots = this.generateTimeSlots(dto.date, dto.start_time, dto.end_time, slotDuration);

    // Prevent duplicate slots for same doctor/date/time
    for (const slot of slots) {
      const duplicate = await this.doctorTimeSlotRepository.findOne({
        where: {
          doctor: { doctor_id: doctorId },
          date: dto.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
        },
        relations: ['doctor'],
      });
      if (duplicate) {
        throw new Error('Duplicate slot detected for this date/time');
      }
    }

    // Save slots
    const slotEntities = slots.map(slot => this.doctorTimeSlotRepository.create({
      doctor: { doctor_id: doctorId } as any,
      doctor_availability: savedAvailability,
      date: dto.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_available: true,
    }));
    await this.doctorTimeSlotRepository.save(slotEntities);

    return { availability: savedAvailability, slots: slotEntities };
  }

  /**
   * Utility to divide a time interval into slots
   */
  private generateTimeSlots(date: string, start: string, end: string, duration: number): Array<{date: string, start_time: string, end_time: string}> {
    const slots: Array<{date: string, start_time: string, end_time: string}> = [];
    let [sh, sm] = start.split(':').map(Number);
    let [eh, em] = end.split(':').map(Number);
    let startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;
    while (startMinutes + duration <= endMinutes) {
      const slotStart = `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}`;
      const slotEndMinutes = startMinutes + duration;
      const slotEnd = `${String(Math.floor(slotEndMinutes / 60)).padStart(2, '0')}:${String(slotEndMinutes % 60).padStart(2, '0')}`;
      slots.push({ date, start_time: slotStart, end_time: slotEnd });
      startMinutes += duration;
    }
    return slots;
  }

  /**
   * Get available slots for a doctor (paginated, is_available = true, date >= today)
   */
  async getAvailableSlots(doctorId: number, query: GetDoctorAvailabilityDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().slice(0, 10);

    const [slots, total] = await this.doctorTimeSlotRepository.findAndCount({
      where: {
        doctor: { doctor_id: doctorId },
        is_available: true,
        date: MoreThanOrEqual(todayStr),
      },
      relations: ['doctor', 'doctor_availability'],
      order: { date: 'ASC', start_time: 'ASC' },
      skip,
      take: limit,
    });
    return {
      total,
      page,
      limit,
      slots,
    };
  }

  async updateScheduleType(doctorId: number, schedule_Type: 'stream' | 'wave', reqUser?: { id: number, role: string }) {
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId }, relations: ['user'] });
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    if (reqUser && doctor.user && doctor.user.id !== reqUser.id && reqUser.role !== 'admin') {
      throw new Error('Not allowed to update schedule type for this doctor');
    }
    doctor.schedule_Type = schedule_Type;
    return this.doctorRepository.save(doctor);
  }

  async addSlot(doctorId: number, dto: any, reqUser: any) {
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId }, relations: ['user'] });
    if (!doctor) throw new NotFoundException('Doctor not found');
    console.log('DEBUG addSlot:', {
      doctorUser: doctor.user,
      doctorUserId: doctor.user?.id,
      reqUser,
      reqUserId: reqUser.id,
      reqUserRole: reqUser.role
    });
    if (doctor.user && doctor.user.id !== reqUser.userId && reqUser.role !== 'admin') throw new Error('Not allowed');
    const slot = this.doctorTimeSlotRepository.create({
      doctor,
      date: dto.date,
      start_time: dto.start_time,
      end_time: dto.end_time,
      patients_per_slot: dto.patients_per_slot,
      booking_start_time: dto.booking_start_time,
      booking_end_time: dto.booking_end_time,
      is_available: true,
    });
    return this.doctorTimeSlotRepository.save(slot);
  }

  async editSlot(doctorId: number, slotId: number, dto: any, reqUser: any) {
    if (!dto) throw new (await import('@nestjs/common')).BadRequestException('Request body is missing or invalid');
    const slot = await this.doctorTimeSlotRepository.findOne({ where: { id: slotId }, relations: ['doctor'] });
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.doctor.doctor_id !== doctorId) throw new Error('Slot does not belong to this doctor');
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId }, relations: ['user'] });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.user && doctor.user.id !== reqUser.userId && reqUser.role !== 'admin') throw new Error('Not allowed');
    // Check for existing appointments
    const appointmentRepo = (this as any).appointmentRepository || null;
    if (appointmentRepo) {
      const count = await appointmentRepo.count({ where: { doctor_time_slot: slot } });
      if (count > 0) throw new Error('You cannot modify this slot because an appointment is already booked in this session.');
    }
    // Explicitly assign fields
    if (dto.start_time !== undefined) slot.start_time = dto.start_time;
    if (dto.end_time !== undefined) slot.end_time = dto.end_time;
    if (dto.date !== undefined) slot.date = dto.date;
    if (dto.patients_per_slot !== undefined) slot.patients_per_slot = dto.patients_per_slot;
    if (dto.booking_start_time !== undefined) slot.booking_start_time = dto.booking_start_time;
    if (dto.booking_end_time !== undefined) slot.booking_end_time = dto.booking_end_time;
    if (dto.is_available !== undefined) slot.is_available = dto.is_available;
    const updated = await this.doctorTimeSlotRepository.save(slot);
    console.log('Saved slot:', updated);
    return updated;
  }

  async deleteSlot(doctorId: number, slotId: number, reqUser: any) {
    const slot = await this.doctorTimeSlotRepository.findOne({ where: { id: slotId }, relations: ['doctor'] });
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.doctor.doctor_id !== doctorId) throw new Error('Slot does not belong to this doctor');
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: doctorId }, relations: ['user'] });
    if (!doctor) throw new NotFoundException('Doctor not found');
    if (doctor.user && doctor.user.id !== reqUser.userId && reqUser.role !== 'admin') throw new Error('Not allowed');
    // Check for existing appointments
    const appointmentRepo = (this as any).appointmentRepository || null;
    if (appointmentRepo) {
      const count = await appointmentRepo.count({ where: { doctor_time_slot: slot } });
      if (count > 0) throw new Error('You cannot modify this slot because an appointment is already booked in this session.');
    }
    return this.doctorTimeSlotRepository.remove(slot);
  }
} 