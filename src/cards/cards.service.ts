
import * as fs from 'fs-extra';
import { decompress } from 'compress-json';

import { Injectable } from '@nestjs/common';
import { ICard } from './card.interface';

@Injectable()
export class CardsService {

  private cards = [];
  private cardsByCode = {};
  private lastCardVersion = '';

  async onModuleInit() {
    if(fs.existsSync('version.json')) {
      const versionJson = fs.readJsonSync('version.json');
      this.lastCardVersion = versionJson.version;
    }

    if(fs.existsSync('cards.json')) {
      const cardData = fs.readJsonSync('cards.json');
      this.setCards(cardData);
    } else {
      this.updateCards();
    }
  }

  private async getLatestVersion(): Promise<string> {
    const versionData = await fetch('https://data.limelight.cards/version.json');
    const versionJson = await versionData.json();

    return versionJson.version;
  }

  private async isVersionLatest(): Promise<boolean> {
    const latestVersion = await this.getLatestVersion();

    return this.lastCardVersion === latestVersion;
  }

  private async updateCards() {
    const isLatest = await this.isVersionLatest();

    if(!isLatest) {
      this.lastCardVersion = await this.getLatestVersion();

      const cardData = await fetch('https://data.limelight.cards/cards.min.json');
      const cardJson = await cardData.json();

      this.setCards(decompress(cardJson));
      fs.writeJsonSync('cards.json', this.cards);
      fs.writeJsonSync('version.json', { version: this.lastCardVersion });
    }
  }

  private setCards(cards: ICard[]) {
    this.cards = cards;
    this.cardsByCode = {};

    this.cards.forEach(card => {
      this.cardsByCode[card.code] = card;
    });
  }

  public getCardById(code: string): ICard {
    return this.cardsByCode[code];
  }
}
