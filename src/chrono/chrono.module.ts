import { Module } from '@nestjs/common';
import { ChronoController } from './chrono.controller';
import { ChronoService } from './chrono.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ChronoController],
  providers: [ChronoService, PrismaService]
})
export class ChronoModule {}
