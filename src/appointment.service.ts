import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';
import { MoreThanOrEqual } from 'typeorm';

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

    // 3. Enforce one booking per session per day per doctor per patient
    const existing = await this.appointmentRepository.findOne({
      where: {
        doctor: { doctor_id: dto.doctor_id },
        patient: { patient_id: patientId },
        appointment_date: new Date(dto.date),
        session: dto.session,
      },
    });
    if (existing) {
      throw new ConflictException('Already booked for this session');
    }

    // 4. Find the slot
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

    // Booking window validation
    if (slot.booking_start_time && slot.booking_end_time) {
      const now = new Date();
      const [bsH, bsM] = slot.booking_start_time.split(':').map(Number);
      const [beH, beM] = slot.booking_end_time.split(':').map(Number);
      const bookingStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), bsH, bsM);
      const bookingEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), beH, beM);
      if (now < bookingStart || now > bookingEnd) {
        throw new (await import('@nestjs/common')).ForbiddenException('Booking is only allowed within the booking window for this slot.');
      }
    }

    // 5. Check schedule type and handle accordingly
    let reporting_time: string | undefined = undefined;
    if (doctor.schedule_Type === 'stream') {
      // Use doctor's preferred slot duration
      if (!slot.is_available) {
        throw new ConflictException('Slot already booked');
      }
      slot.is_available = false;
      await this.doctorTimeSlotRepository.save(slot);
      // reporting_time is slot.start_time
      reporting_time = slot.start_time;
    } else if (doctor.schedule_Type === 'wave') {
      // Use patients_per_slot and slot duration calculated from slot times
      const patients_per_slot = slot.patients_per_slot || dto.patients_per_slot;
      // Calculate slot_duration as end_time - start_time (in minutes)
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const [eh, em] = slot.end_time.split(':').map(Number);
      const slot_duration = (eh * 60 + em) - (sh * 60 + sm);
      if (!patients_per_slot || !slot_duration) {
        throw new ConflictException('Wave slot configuration missing');
      }
      // Count current appointments in this slot
      const appointments = await this.appointmentRepository.find({
        where: {
          doctor_time_slot: slot,
        },
        order: { created_at: 'ASC' },
      });
      if (appointments.length >= patients_per_slot) {
        throw new ConflictException('Wave slot is full');
      }
      // Calculate reporting time
      const perPatientDuration = slot_duration / patients_per_slot;
      const reportingMinutes = sh * 60 + sm + Math.floor(perPatientDuration * appointments.length);
      const reportingHour = Math.floor(reportingMinutes / 60).toString().padStart(2, '0');
      const reportingMin = (reportingMinutes % 60).toString().padStart(2, '0');
      reporting_time = `${reportingHour}:${reportingMin}`;
      // Optionally, set slot.is_available = false if full
      if (appointments.length + 1 >= patients_per_slot) {
        slot.is_available = false;
        await this.doctorTimeSlotRepository.save(slot);
      }
    }

    // 6. Create appointment
    const appointment = this.appointmentRepository.create({
      doctor,
      patient,
      appointment_date: new Date(dto.date),
      appointment_status: 'booked',
      reason: '',
      notes: '',
      session: dto.session || undefined,
      reporting_time,
      doctor_time_slot: slot,
    });
    await this.appointmentRepository.save(appointment);

    return { message: 'Appointment booked successfully', appointment };
  }

  async getUpcomingAppointmentsForPatient(userId: number) {
    // Find patient by userId
    const patient = await this.patientRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) throw new NotFoundException('Patient not found');
    const today = new Date();
    return this.appointmentRepository.find({
      where: {
        patient: { patient_id: patient.patient_id },
        appointment_date: MoreThanOrEqual(today),
      },
      order: { appointment_date: 'ASC', reporting_time: 'ASC' },
      relations: ['doctor', 'doctor_time_slot'],
    });
  }

  async getUpcomingAppointmentsForDoctor(userId: number) {
    // Find doctor by userId
    const doctor = await this.doctorRepository.findOne({ where: { user: { id: userId } } });
    if (!doctor) throw new NotFoundException('Doctor not found');
    const today = new Date();
    return this.appointmentRepository.find({
      where: {
        doctor: { doctor_id: doctor.doctor_id },
        appointment_date: MoreThanOrEqual(today),
      },
      order: { appointment_date: 'ASC', reporting_time: 'ASC' },
      relations: ['patient', 'doctor_time_slot'],
    });
  }
} 