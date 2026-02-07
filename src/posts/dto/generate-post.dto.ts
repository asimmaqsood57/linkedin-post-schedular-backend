import { IsString, IsIn } from 'class-validator';

export class GeneratePostDto {
  @IsString()
  @IsIn(['Technology', 'Business', 'Career', 'Marketing'])
  category: string;
}