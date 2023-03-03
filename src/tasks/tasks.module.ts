import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { SubtasksService } from '../subtasks/subtasks.service';

@Module({
  controllers: [TasksController],
  providers: [TasksService, SubtasksService]
})
export class TasksModule {}
