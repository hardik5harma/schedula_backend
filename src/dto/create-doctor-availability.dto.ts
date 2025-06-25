import { IsDateString, IsString, IsOptional, IsNumber, Min, Max, Matches } from 'class-validator';

export class CreateDoctorAvailabilityDto {
  @IsDateString()
  date: string;

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  start_time: string; // HH:mm

  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  end_time: string; // HH:mm

  @IsOptional()
  @IsString()
  weekdays?: string;

  @IsString()
  session: string;

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(180)
  slot_duration?: number = 30;
} 