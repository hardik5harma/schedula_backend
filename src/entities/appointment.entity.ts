import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';
import { TimeSlot } from './time-slot.entity';
import { DoctorTimeSlot } from './doctor-time-slot.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  patient: Patient;

  @Column('date')
  appointment_date: Date;

  @ManyToOne(() => TimeSlot)
  time_slot: TimeSlot;

  @Column()
  appointment_status: string;

  @Column('text')
  reason: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ type: 'varchar', nullable: true })
  session: string;

  @Column({ type: 'time', nullable: true })
  reporting_time: string;

  @ManyToOne(() => DoctorTimeSlot, { nullable: true })
  doctor_time_slot: DoctorTimeSlot;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 