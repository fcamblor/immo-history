import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import {AuthenticationHeaderInterceptor} from "./auth.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({limit: '50mb'}));
  app.enableCors({
    origin: [/leboncoin\.fr$/ /* , /localhost/ */],
    methods: ['GET', 'PUT', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Content-Length', 'Authorization']
  });
  app.useGlobalInterceptors(new AuthenticationHeaderInterceptor())
  await app.listen( process.env.PORT || 3001);
}
bootstrap();
