import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from 'typeorm';
import { Appointment } from './appointment.entity';
import { User } from './user.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  patient_id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  phone_number: string;

  @Column()
  gender: string;

  @Column('date')
  dob: Date;

  @Column()
  address: string;

  @Column()
  emergency_contact: string;

  @Column('text')
  medical_history: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @ManyToOne(() => User)
  user: User;
} 