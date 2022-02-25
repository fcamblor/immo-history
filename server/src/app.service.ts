import { Injectable } from '@nestjs/common';
import {ScrappedData} from '../../domain/dist/domain-types.js'
import {DbService} from "./db.service";

@Injectable()
export class AppService {
  constructor(private readonly dbService: DbService) {
  }

  async createScrapEntry(scrapEntry: ScrappedData) {
    await this.dbService.query(`
      INSERT INTO scrapped_entry(
           title, publish_date, price, page_html, html_description, 
           contact_name, living_surface, ground_surface, energy_rate, ges_rate
      ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8, $9, $10
      ) 
    `, ...[
           scrapEntry.title, scrapEntry.publishDate, scrapEntry.price, scrapEntry.html, scrapEntry.htmlDescription,
           scrapEntry.contactName, scrapEntry.livingSurface, scrapEntry.groundSurface, scrapEntry.energyRate, scrapEntry.gesRate
    ])
  }
}
