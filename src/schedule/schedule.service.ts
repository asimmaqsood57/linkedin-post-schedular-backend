import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  private calculateNextRunTime(frequency: string, interval: number = 1): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'custom':
        now.setDate(now.getDate() + interval);
        break;
    }
    
    // Set to specific time (e.g., 9 AM)
    now.setHours(9, 0, 0, 0);
    
    return now;
  }

  async create(createScheduleDto: CreateScheduleDto, userId: string) {
    const nextRunAt = this.calculateNextRunTime(
      createScheduleDto.frequency,
      createScheduleDto.interval || 1,
    );

    return this.prisma.schedule.create({
      data: {
        name: createScheduleDto.name,
        description: createScheduleDto.description,
        frequency: createScheduleDto.frequency,
        interval: createScheduleDto.interval || 1,
        categories: createScheduleDto.categories,
        isActive: createScheduleDto.isActive ?? true,
        nextRunAt,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.schedule.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
      include: {
        posts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    // Recalculate next run time if frequency changed
    let nextRunAt = schedule.nextRunAt;
    if (updateScheduleDto.frequency || updateScheduleDto.interval) {
      nextRunAt = this.calculateNextRunTime(
        updateScheduleDto.frequency || schedule.frequency,
        updateScheduleDto.interval || schedule.interval,
      );
    }

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...updateScheduleDto,
        nextRunAt,
      },
    });
  }

  async delete(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.schedule.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, userId: string) {
    const schedule = await this.prisma.schedule.findFirst({
      where: { id, userId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return this.prisma.schedule.update({
      where: { id },
      data: { isActive: !schedule.isActive },
    });
  }

  // Method for cron job to get due schedules
  async getDueSchedules() {
    return this.prisma.schedule.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: new Date(),
        },
      },
      include: {
        user: {
          include: {
            linkedinAccounts: true,
          },
        },
      },
    });
  }

  // Method to update schedule after running
  async updateAfterRun(scheduleId: string) {
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) return;

    const nextRunAt = this.calculateNextRunTime(
      schedule.frequency,
      schedule.interval,
    );

    await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        lastRunAt: new Date(),
        nextRunAt,
      },
    });
  }
}