import { IsString, IsOptional, IsArray, IsInt, IsBoolean, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ScheduleFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export class UpdateScheduleDto {
  @ApiProperty({
    example: 'Updated Schedule Name',
    description: 'Schedule name',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Updated description',
    description: 'Optional description or topic for AI generation',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'weekly',
    description: 'Posting frequency',
    enum: ['daily', 'weekly', 'monthly', 'custom'],
    required: false,
  })
  @IsOptional()
  @IsEnum(ScheduleFrequency)
  frequency?: string;

  @ApiProperty({
    example: 3,
    description: 'Interval for custom frequency',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  interval?: number;

  @ApiProperty({
    example: ['Technology', 'Career'],
    description: 'Categories to rotate through',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiProperty({
    example: false,
    description: 'Whether the schedule is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}