import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:4200'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip props that are not defined in the DTO class
      transform: true,
    }),
  );

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('YATA')
    .setDescription('RESTful API for YATA')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(7070);
}
bootstrap();
