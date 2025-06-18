import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TimeSlot } from './time-slot.entity';
import { Appointment } from './appointment.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  doctor_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone_number: string;

  @Column()
  specialization: string;

  @Column('int', { nullable: true })
  experience_years: number;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  clinic_name: string;

  @Column('simple-array', { nullable: true })
  available_days: string[];

  @Column('simple-array', { nullable: true })
  available_time_slots: string[];

  @Column()
  password: string;

  @Column({ nullable: true })
  hashed_refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TimeSlot, (slot) => slot.doctor)
  timeSlots: TimeSlot[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];
} 