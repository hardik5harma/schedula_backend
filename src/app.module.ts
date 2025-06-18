import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Doctor, Patient, TimeSlot, Appointment],
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Doctor, Patient, TimeSlot, Appointment]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
