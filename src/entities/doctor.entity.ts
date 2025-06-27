import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { TimeSlot } from './time-slot.entity';
import { Appointment } from './appointment.entity';
import { User } from './user.entity';
import { DoctorAvailability } from './doctor-availability.entity';
import { DoctorTimeSlot } from './doctor-time-slot.entity';

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

  @Column({ type: 'enum', enum: ['stream', 'wave'], default: 'stream' })
  schedule_Type: 'stream' | 'wave';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => TimeSlot, (slot) => slot.doctor)
  timeSlots: TimeSlot[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @ManyToOne(() => User)
  user: User;

  @OneToMany(() => DoctorAvailability, availability => availability.doctor)
  availabilities: DoctorAvailability[];

  @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor)
  doctorTimeSlots: DoctorTimeSlot[];
} 