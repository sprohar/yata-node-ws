import { Module } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [TasksController],
  providers: [ProjectsService,TasksService]
})
export class TasksModule {}
