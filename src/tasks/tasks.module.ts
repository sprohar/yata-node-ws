import { Module } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { EisenhowerMatrixController } from './eisenhower-matrix.controller';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  controllers: [EisenhowerMatrixController, TasksController],
  providers: [ProjectsService, TasksService],
})
export class TasksModule {}
