import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [ProjectsModule, PrismaModule, TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
