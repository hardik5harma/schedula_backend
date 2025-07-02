import { IsInt, IsString, IsDateString, Matches } from 'class-validator';

export class BookAppointmentDto {
  @IsInt()
  doctor_id: number;

  @IsDateString()
  date: string;

  @IsString()
  weekday: string;

  @IsString()
  session: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  start_time: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  end_time: string;

  @IsInt()
  patients_per_slot?: number;

  @IsInt()
  slot_duration?: number;
} 