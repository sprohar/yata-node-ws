import { Module } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { ChronoController } from './chrono.controller';

@Module({
  controllers: [ChronoController],
  providers: [TasksService]
})
export class ChronoModule {}
