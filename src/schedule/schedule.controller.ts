import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@ApiTags('schedules')
@Controller('schedules')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create recurring schedule',
    description: 'Create a new recurring schedule for automated post generation and publishing',
  })
  @ApiBody({ type: CreateScheduleDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Schedule created successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Daily Tech Posts',
        description: 'AI trends and innovations',
        frequency: 'daily',
        interval: 1,
        categories: ['Technology', 'Business'],
        isActive: true,
        lastRunAt: null,
        nextRunAt: '2026-02-09T09:00:00.000Z',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-02-08T10:00:00.000Z',
        updatedAt: '2026-02-08T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  create(@Body() createScheduleDto: CreateScheduleDto, @CurrentUser() user: any) {
    return this.scheduleService.create(createScheduleDto, user.id);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all schedules',
    description: 'Retrieve all recurring schedules for the authenticated user',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedules retrieved successfully',
    schema: {
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Daily Tech Posts',
          description: 'AI trends',
          frequency: 'daily',
          interval: 1,
          categories: ['Technology'],
          isActive: true,
          lastRunAt: '2026-02-08T09:00:00.000Z',
          nextRunAt: '2026-02-09T09:00:00.000Z',
          userId: '123e4567-e89b-12d3-a456-426614174001',
          createdAt: '2026-02-07T10:00:00.000Z',
          updatedAt: '2026-02-08T09:00:00.000Z',
          _count: {
            posts: 15,
          },
        },
      ],
    },
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  findAll(@CurrentUser() user: any) {
    return this.scheduleService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get a single schedule',
    description: 'Retrieve a specific schedule with its recent posts',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Schedule ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule retrieved successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Daily Tech Posts',
        description: 'AI trends',
        frequency: 'daily',
        interval: 1,
        categories: ['Technology'],
        isActive: true,
        lastRunAt: '2026-02-08T09:00:00.000Z',
        nextRunAt: '2026-02-09T09:00:00.000Z',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-02-07T10:00:00.000Z',
        updatedAt: '2026-02-08T09:00:00.000Z',
        posts: [
          {
            id: 'post-uuid-1',
            content: 'Post content...',
            category: 'Technology',
            status: 'published',
            createdAt: '2026-02-08T09:00:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Schedule not found',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scheduleService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update a schedule',
    description: 'Update schedule settings (recalculates next run time if frequency changed)',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Schedule ID (UUID)',
  })
  @ApiBody({ type: UpdateScheduleDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule updated successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Updated Schedule Name',
        description: 'Updated description',
        frequency: 'weekly',
        interval: 1,
        categories: ['Technology', 'Career'],
        isActive: true,
        lastRunAt: '2026-02-08T09:00:00.000Z',
        nextRunAt: '2026-02-15T09:00:00.000Z',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        createdAt: '2026-02-07T10:00:00.000Z',
        updatedAt: '2026-02-08T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Schedule not found',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.scheduleService.update(id, updateScheduleDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a schedule',
    description: 'Permanently delete a recurring schedule',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Schedule ID (UUID)',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule deleted successfully',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Schedule not found',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scheduleService.delete(id, user.id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ 
    summary: 'Toggle schedule active status',
    description: 'Enable or disable a schedule without deleting it',
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Schedule ID (UUID)',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Schedule status toggled successfully',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isActive: false,
        updatedAt: '2026-02-08T11:00:00.000Z',
      },
    },
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Schedule not found',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  toggleActive(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scheduleService.toggleActive(id, user.id);
  }
}