import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { AppService } from './app.service';
import {ScrappedData} from '../../domain/dist/domain-types.js'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post("/createScrapEntry")
  createScrapEntry(@Body() obj: ScrappedData): string {
    this.appService.createScrapEntry(obj);

    return `Hello world !`;
  }

  @Get("/test")
  hello(@Query("who") who: string): string {
    console.log(who);
    return `Hello ${who}`
  }
}
