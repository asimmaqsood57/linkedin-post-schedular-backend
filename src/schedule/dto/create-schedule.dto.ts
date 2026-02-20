import { IsString, IsOptional, IsArray, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export class CreateScheduleDto {
  @ApiProperty({
    example: 'Daily Tech Posts',
    description: 'Schedule name',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'AI trends and innovations',
    description: 'Optional description or topic for AI generation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'daily',
    description: 'Posting frequency',
    enum: ['daily', 'weekly', 'monthly', 'custom'],
  })
  @IsEnum(ScheduleFrequency)
  frequency: string;

  @ApiProperty({
    example: 1,
    description: 'Interval for custom frequency (e.g., every 3 days)',
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  interval?: number;

  @ApiProperty({
    example: ['Technology', 'Business'],
    description: 'Categories to rotate through',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the schedule is active',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}