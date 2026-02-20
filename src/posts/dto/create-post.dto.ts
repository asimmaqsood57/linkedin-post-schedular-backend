import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  FAILED = 'failed',
}

export class CreatePostDto {
  @ApiProperty({
    example: 'Excited to share insights on AI automation in business...',
    description: 'Post content (LinkedIn post text)',
  })
  @IsString()
  content: string;

  @ApiProperty({
    example: 'Technology',
    description: 'Post category',
    enum: ['Technology', 'Business', 'Career', 'Marketing'],
  })
  @IsString()
  category: string;

  @ApiProperty({
    example: '2026-02-10T10:00:00.000Z',
    description: 'Scheduled date and time (UTC ISO format)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    example: 'draft',
    description: 'Post status',
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;
}