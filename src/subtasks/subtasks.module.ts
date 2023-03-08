import { Module } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { SubtasksController } from './subtasks.controller';
import { SubtasksService } from './subtasks.service';

@Module({
  controllers: [SubtasksController],
  providers: [TasksService, SubtasksService],
})
export class SubtasksModule {}
