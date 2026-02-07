import { IsString, IsArray, IsIn, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsIn(['daily', 'weekly', 'monthly', 'custom'])
  frequency: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  interval?: number; // For custom frequency

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}