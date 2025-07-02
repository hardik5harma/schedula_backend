import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';
import { DoctorAvailability } from './doctor-availability.entity';

@Entity('doctor_time_slots')
export class DoctorTimeSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, doctor => doctor.doctorTimeSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ManyToOne(() => DoctorAvailability, availability => availability.timeSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorAvailabilityId' })
  doctor_availability: DoctorAvailability;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'boolean', default: true })
  is_available: boolean;

  @Column('int', { nullable: true })
  patients_per_slot: number;

  @Column('int', { nullable: true })
  slot_duration: number;

  @CreateDateColumn()
  created_at: Date;
} 