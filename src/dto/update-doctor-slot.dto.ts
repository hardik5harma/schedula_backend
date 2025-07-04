import { IsDateString, IsString, IsInt, Min, Max, IsOptional, Matches } from 'class-validator';

export class UpdateDoctorSlotDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  start_time?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  end_time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  patients_per_slot?: number;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  booking_start_time?: string;

  @IsOptional()
  @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
  booking_end_time?: string;
} 