import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { SectionsModule } from './sections/sections.module';
import { SubtasksModule } from './subtasks/subtasks.module';
import { TasksModule } from './tasks/tasks.module';
import { TagsModule } from './tags/tags.module';
import { ChronoModule } from './chrono/chrono.module';
import { UsersModule } from './users/users.module';

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
    TagsModule,
    ChronoModule,
    UsersModule,
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
