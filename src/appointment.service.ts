import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(DoctorTimeSlot)
    private doctorTimeSlotRepository: Repository<DoctorTimeSlot>,
  ) {}

  async bookAppointment(dto: BookAppointmentDto, patientId: number) {
    // 1. Find doctor
    const doctor = await this.doctorRepository.findOne({ where: { doctor_id: dto.doctor_id } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // 2. Find patient
    const patient = await this.patientRepository.findOne({ where: { patient_id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    // 3. Find the slot
    const slot = await this.doctorTimeSlotRepository.findOne({
      where: {
        doctor: { doctor_id: dto.doctor_id },
        date: dto.date,
        start_time: dto.start_time,
        end_time: dto.end_time,
      },
      relations: ['doctor'],
    });
    if (!slot) throw new NotFoundException('Time slot not found');

    // 4. Check schedule type
    if (doctor.schedule_Type === 'stream') {
      // Only one appointment per slot
      if (!slot.is_available) {
        throw new ConflictException('Slot already booked');
      }
      // Book appointment
      slot.is_available = false;
      await this.doctorTimeSlotRepository.save(slot);
    } else if (doctor.schedule_Type === 'wave') {
      // Allow up to 3 patients per slot
      // We'll use a simple count of appointments for this slot
      const count = await this.appointmentRepository.count({
        where: {
          doctor: { doctor_id: dto.doctor_id },
          appointment_date: new Date(dto.date),
          // Optionally, match start_time/end_time if stored in appointment
        },
        // If you store slot reference in appointment, filter by slot
      });
      if (count >= 3) {
        throw new ConflictException('Wave slot is full');
      }
      // Optionally, set slot.is_available = false if count+1 == 3
      if (count + 1 >= 3) {
        slot.is_available = false;
        await this.doctorTimeSlotRepository.save(slot);
      }
    }

    // 5. Create appointment
    const appointment = this.appointmentRepository.create({
      doctor,
      patient,
      appointment_date: new Date(dto.date),
      appointment_status: 'booked',
      reason: '', // You can extend DTO to include reason/notes
      notes: '',
      // Optionally, link to slot
    });
    await this.appointmentRepository.save(appointment);

    return { message: 'Appointment booked successfully', appointment };
  }
} 