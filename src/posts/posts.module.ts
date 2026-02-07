import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { SchedulerService } from './scheduler.service';
import { LinkedinModule } from '../linkedin/linkedin.module';
import { ScheduleModule as CustomScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [LinkedinModule, CustomScheduleModule],
  controllers: [PostsController],
  providers: [PostsService, SchedulerService],
})
export class PostsModule {}