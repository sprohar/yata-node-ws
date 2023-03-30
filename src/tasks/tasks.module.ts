import { Module } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TagsService } from '../tags/tags.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [ProjectsService, TasksService, TagsService],
})
export class TasksModule {}
