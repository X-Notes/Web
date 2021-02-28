import { Injectable } from '@angular/core';
import { BaseText, CheckedList, ContentModel, DotList, Heading, HtmlText, NumberList } from './models/ContentMode';

@Injectable()
export class MenuSelectionService {

  public currentItem: ContentModel<HtmlText | Heading | DotList | NumberList | CheckedList>;
  public menuActive = false;
  public startTop = 0;
  public startScroll = 0;
  public currentScroll = 0;
  public left = 0;
  constructor() { }

  get getTop()
  {
    const positionNumber = this.startTop + this.startScroll - this.currentScroll;
    /*
    if (positionNumber < 0)
    {
      return 5;
    }*/
    return positionNumber;
  }
}
