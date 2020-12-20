import { ElementRef, Injectable } from '@angular/core';

@Injectable()
export class ContentEditableService {

  constructor() { }

  getCaretTopPoint(doc: ElementRef) {
    return window.getSelection().getRangeAt(0);
  }

}
