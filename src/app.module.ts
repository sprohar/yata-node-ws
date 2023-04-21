import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler/dist/throttler.guard';
import { AuthenticationGuard } from './iam/authentication/guards';
import { IamModule } from './iam/iam.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { RedisModule } from './redis/redis.module';
import { SectionsModule } from './sections/sections.module';
import { TagsModule } from './tags/tags.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    ProjectsModule,
    PrismaModule,
    TasksModule,
    SectionsModule,
    TagsModule,
    IamModule,
    UsersModule,
    RedisModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    // This uses the auth0 middleware to validate the access token issued by Auth0
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthorizationGuard,
    // },
  ],
})
export class AppModule {}
