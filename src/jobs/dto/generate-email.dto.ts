import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateEmailDto {
  @ApiProperty()
  @IsString()
  jobTitle: string;

  @ApiProperty()
  @IsString()
  company: string;

  @ApiProperty()
  @IsString()
  jobDescription: string;
}