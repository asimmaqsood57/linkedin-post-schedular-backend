import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { LinkedinService } from '../linkedin/linkedin.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private linkedinService: LinkedinService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledPosts() {
    this.logger.log('Checking for scheduled posts...');

    const now = new Date();
    
    // Find posts that are scheduled and due to be published
    const scheduledPosts = await this.prisma.post.findMany({
      where: {
        status: 'scheduled',
        scheduledAt: {
          lte: now,
        },
      },
      include: {
        user: true,
      },
    });

    this.logger.log(`Found ${scheduledPosts.length} posts to publish`);

    for (const post of scheduledPosts) {
      try {
        this.logger.log(`Publishing post ${post.id} for user ${post.userId}`);
        
        await this.linkedinService.publishPost(post.id, post.userId);
        
        this.logger.log(`Successfully published post ${post.id}`);
      } catch (error) {
        this.logger.error(`Failed to publish post ${post.id}: ${error.message}`);
        
        // Update post status to failed
        await this.prisma.post.update({
          where: { id: post.id },
          data: { status: 'failed' },
        });
      }
    }
  }
}