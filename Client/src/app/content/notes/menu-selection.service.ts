import { Injectable } from '@angular/core';

@Injectable()
export class MenuSelectionService {

  public menuActive = false;
  public top = 0;
  public left = 0;
  constructor() { }
}
