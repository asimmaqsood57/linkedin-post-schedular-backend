import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SchedulerService } from './scheduler.service';
import { LinkedinModule } from '../linkedin/linkedin.module';

@Module({
  imports: [LinkedinModule],
  controllers: [PostsController],
  providers: [PostsService, SchedulerService],
})
export class PostsModule {}