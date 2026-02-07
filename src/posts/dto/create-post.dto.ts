import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  status?: string;
}