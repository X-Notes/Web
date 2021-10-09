import { Injectable } from '@angular/core';
import { BaseText } from '../../models/content-model.model';

@Injectable()
export class MenuSelectionService {
  public currentTextItem: BaseText;

  public startTop = 0;

  public startScroll = 0;

  public currentScroll = 0;

  public left = 0;

  get menuActive() {
    return this.currentTextItem !== null;
  }

  get getTop() {
    const positionNumber = this.startTop + this.startScroll - this.currentScroll;
    /*
    if (positionNumber < 0)
    {
      return 5;
    } */
    return positionNumber;
  }
}
