import { IsString } from 'class-validator';

export class UpdateCvDto {
  @IsString()
  cvText: string;
}