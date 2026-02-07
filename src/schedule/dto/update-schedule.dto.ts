import { IsString, IsArray, IsIn, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly', 'custom'])
  frequency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  interval?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}