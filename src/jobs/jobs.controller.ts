import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyzeProfileDto } from './dto/analyze-profile.dto';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { SaveJobDto } from './dto/save-job.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private jobsService: JobsService) {}

  // ── CV Upload ────────────────────────────────────────────────
  @Post('cv/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCv(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
  ) {
    return this.jobsService.uploadCv(
      user.id,
      file.buffer,
      file.originalname,
      file.mimetype,
    );
  }

  @Delete('cv')
  deleteCv(@CurrentUser() user: any) {
    return this.jobsService.deleteCv(user.id);
  }

  @Patch('cv/text')
  updateCvText(@Body() dto: UpdateCvDto, @CurrentUser() user: any) {
    return this.jobsService.updateCvText(dto, user.id);
  }

  // ── Profile ──────────────────────────────────────────────────
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.jobsService.getProfile(user.id);
  }

  @Post('profile/analyze')
  analyzeProfile(@Body() dto: AnalyzeProfileDto, @CurrentUser() user: any) {
    return this.jobsService.analyzeProfile(dto, user.id);
  }

  // ── Job Search ───────────────────────────────────────────────
  @Get('search')
  searchJobs(
    @CurrentUser() user: any,
    @Query('keywords') keywords?: string,
  ) {
    return this.jobsService.searchJobs(user.id, keywords);
  }

  // ── Email Generation ─────────────────────────────────────────
  @Post('email')
  generateEmail(@Body() dto: GenerateEmailDto, @CurrentUser() user: any) {
    return this.jobsService.generateApplicationEmail(dto, user.id);
  }

  // ── Saved Jobs ───────────────────────────────────────────────
  @Post('saved')
  saveJob(@Body() dto: SaveJobDto, @CurrentUser() user: any) {
    return this.jobsService.saveJob(dto, user.id);
  }

  @Get('saved')
  getSavedJobs(@CurrentUser() user: any) {
    return this.jobsService.getSavedJobs(user.id);
  }

  @Delete('saved/:externalId')
  removeSavedJob(
    @Param('externalId') externalId: string,
    @CurrentUser() user: any,
  ) {
    return this.jobsService.removeSavedJob(externalId, user.id);
  }
}