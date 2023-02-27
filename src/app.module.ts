import { Module } from '@nestjs/common';
import { ProjectsModule } from './projects/projects.module';
import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { SubtasksModule } from './subtasks/subtasks.module';
import { SectionsModule } from './sections/sections.module';

@Module({
  imports: [
    ProjectsModule,
    PrismaModule,
    TasksModule,
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    SubtasksModule,
    SectionsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
