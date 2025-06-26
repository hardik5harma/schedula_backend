import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, JoinColumn } from 'typeorm';
import { Doctor } from './doctor.entity';
import { DoctorTimeSlot } from './doctor-time-slot.entity';

@Entity('doctor_availabilities')
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Doctor, doctor => doctor.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'varchar', nullable: true })
  weekdays: string;

  @Column({ type: 'varchar' })
  session: string;

  @OneToMany(() => DoctorTimeSlot, timeSlot => timeSlot.doctor_availability)
  timeSlots: DoctorTimeSlot[];

  @CreateDateColumn()
  created_at: Date;
} 