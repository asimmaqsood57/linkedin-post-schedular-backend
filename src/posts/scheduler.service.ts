import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { LinkedinService } from '../linkedin/linkedin.service';
import { ScheduleService } from '../schedule/schedule.service';
import { PostsService } from './posts.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private linkedinService: LinkedinService,
    private scheduleService: ScheduleService,
    private postsService: PostsService,
  ) {}

  // Check for one-time scheduled posts every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    this.logger.log('Checking for scheduled posts...');

    const now = new Date();
    
    const scheduledPosts = await this.prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
        scheduleId: null, // Only one-time posts
      },
      include: {
        user: true,
      },
    });

    this.logger.log(`Found ${scheduledPosts.length} one-time posts to publish`);

    for (const post of scheduledPosts) {
      try {
        this.logger.log(`Publishing post ${post.id} for user ${post.userId}`);
        
        await this.linkedinService.publishPost(post.id, post.userId);
        
        this.logger.log(`Successfully published post ${post.id}`);
      } catch (error) {
        this.logger.error(`Failed to publish post ${post.id}: ${error.message}`);
        
        await this.prisma.post.update({
          where: { id: post.id },
          data: { status: 'failed' },
        });
      }
    }
  }

  // Check for recurring schedules every minute
  @Cron(CronExpression.EVERY_MINUTE)
  async handleRecurringSchedules() {
    this.logger.log('Checking for due recurring schedules...');

    const dueSchedules = await this.scheduleService.getDueSchedules();

    this.logger.log(`Found ${dueSchedules.length} schedules to run`);

    for (const schedule of dueSchedules) {
      try {
        this.logger.log(`Processing schedule ${schedule.id} for user ${schedule.userId}`);

        // Check if user has LinkedIn connected
        if (!schedule.user.linkedinAccounts || schedule.user.linkedinAccounts.length === 0) {
          this.logger.warn(`User ${schedule.userId} has no LinkedIn account connected`);
          continue;
        }

        // Pick a random category from the schedule's categories
        const category = schedule.categories[Math.floor(Math.random() * schedule.categories.length)];

        this.logger.log(`Generating post for category: ${category}`);

        // Generate post using AI
        const generatedPost = await this.postsService.generatePost(
          { category },
          schedule.userId,
        );

        // Add description to the prompt if provided
        let content = generatedPost.content;
        if (schedule.description) {
          // Regenerate with custom description
          const customPrompt = await this.postsService.generatePostWithDescription(
            category,
            schedule.description,
            schedule.userId,
          );
          content = customPrompt.content;
        }

        // Create and save the post
        const post = await this.prisma.post.create({
          data: {
            content,
            category,
            status: 'scheduled',
            scheduledAt: new Date(),
            userId: schedule.userId,
            scheduleId: schedule.id,
          },
        });

        this.logger.log(`Created post ${post.id} from schedule ${schedule.id}`);

        // Publish to LinkedIn immediately
        await this.linkedinService.publishPost(post.id, schedule.userId);

        this.logger.log(`Successfully published post ${post.id} from schedule ${schedule.id}`);

        // Update schedule's next run time
        await this.scheduleService.updateAfterRun(schedule.id);

        this.logger.log(`Updated schedule ${schedule.id} next run time`);

      } catch (error) {
        this.logger.error(`Failed to process schedule ${schedule.id}: ${error.message}`);
      }
    }
  }
}