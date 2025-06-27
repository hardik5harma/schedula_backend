import { IsEnum } from 'class-validator';

export class UpdateScheduleTypeDto {
  @IsEnum(['stream', 'wave'])
  schedule_Type: 'stream' | 'wave';
} 