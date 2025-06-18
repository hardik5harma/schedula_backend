import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity()
export class TimeSlot {
  @PrimaryGeneratedColumn()
  slot_id: number;

  @ManyToOne(() => Doctor, (doctor) => doctor.timeSlots)
  doctor: Doctor;

  @Column()
  day_of_week: string;

  @Column()
  start_time: string;

  @Column()
  end_time: string;
} 