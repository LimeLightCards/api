
export enum CardType {
  Character = 'Character',
  Climax = 'Climax',
  Event = 'Event'
}

export enum CardColor {
  Red = 'R',
  Blue = 'B',
  Green = 'G',
  Yellow = 'Y'
}

export enum CardTrigger {
  Choice = 'Choice',
  Comeback = 'Comeback',
  Draw = 'Draw',
  Gate = 'Gate',
  Pool = 'Pool',
  Return = 'Return',
  Shot = 'Shot',
  Soul = 'Soul',
  Standby = 'Standby',
  Treasure = 'Treasure',
}

export interface ICardData {
  name: string;
  code: string;
  rarity: string;
  expansion: string;
  side: 'W'|'S';
  type: CardType;
  color: CardColor;
  level: 0|1|2|3;
  cost: 0|1|2|3|4|5|6|7|8|9;
  power: number;
  soul: 0|1|2|3;
  trigger: CardTrigger[];
  attributes: [string, string];
  ability: string[];
  flavorText: string;
  set: string;
  release: string;
  sid: string;
  image: string;
}

export type ICard = ICardData & {
  tags: string[]
};
