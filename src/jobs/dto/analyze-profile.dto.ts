import { IsString, IsOptional } from 'class-validator';

export class AnalyzeProfileDto {
  @IsOptional()
  @IsString()
  linkedinBio?: string;

  // Client-extracted text — preferred over S3 PDF parsing
  @IsOptional()
  @IsString()
  cvText?: string;

  // S3 key for file download link only
  @IsOptional()
  @IsString()
  cvS3Key?: string;

  @IsOptional()
  @IsString()
  cvFileName?: string;

  @IsOptional()
  @IsString()
  cvMimeType?: string;
}