import { Injectable } from '@nestjs/common';

import { CensorSensor } from 'censor-sensor';

@Injectable()
export class TextCleanerService {

  private censor = new CensorSensor();

  cleanString(str: string): string {
    return this.censor.cleanProfanity(str);
  }

}
