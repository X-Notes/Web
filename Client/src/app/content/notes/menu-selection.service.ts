import { Injectable } from '@angular/core';
import { BaseText, ContentModel } from './models/ContentMode';

@Injectable()
export class MenuSelectionService {

  public currentItem: ContentModel<BaseText>;
  public menuActive = false;
  public top = 0;
  public left = 0;
  constructor() { }
}
