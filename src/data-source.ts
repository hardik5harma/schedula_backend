import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { Appointment } from './entities/appointment.entity';
import { User } from './entities/user.entity';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Doctor, Patient, TimeSlot, Appointment, DoctorAvailability, DoctorTimeSlot],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
}); 