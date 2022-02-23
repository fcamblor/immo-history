import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { AppService } from './app.service';
import type {ScrappedData} from '../../domain/dist/domain-types'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/createScrapEntry")
  createScrapEntry(@Body() obj: ScrappedData): string {
    this.appService.getHello();

    return `Hello world !`;
  }

  @Get("/test")
  hello(@Query("who") who: string): string {
    console.log(who);
    return `Hello ${who}`
  }
}
