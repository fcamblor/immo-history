import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({limit: '50mb'}));
  app.enableCors({
    origin: [/leboncoin\.fr$/ /* , /localhost/ */],
    methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Content-Length', 'Authorization']
  });
  await app.listen(3000);
}
bootstrap();
