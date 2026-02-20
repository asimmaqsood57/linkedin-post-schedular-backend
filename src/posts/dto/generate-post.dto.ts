import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePostDto {
  @ApiProperty({
    example: 'Technology',
    description: 'Category for AI post generation',
    enum: ['Technology', 'Business', 'Career', 'Marketing'],
  })
  @IsString()
  category: string;

  @ApiProperty({
    example: 'Focus on AI automation trends and business impact',
    description: 'Optional instructions for AI to customize the post',
    required: false,
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}