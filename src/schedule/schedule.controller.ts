import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto, @CurrentUser() user: any) {
    return this.scheduleService.create(createScheduleDto, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.scheduleService.findAll(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scheduleService.findOne(id, user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.scheduleService.update(id, updateScheduleDto, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scheduleService.delete(id, user.id);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scheduleService.toggleActive(id, user.id);
  }
}