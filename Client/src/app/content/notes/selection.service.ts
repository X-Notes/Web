import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable()
export class SelectionService {

  constructor() { }

  selectionHandler(secondRect: DOMRect, refElements: QueryList<ElementRef>) {
    const refElementsArray = refElements.toArray();
    const length = refElementsArray.length - 1;
    for (let i = 0 ; i < length; i++) {
      const html = refElementsArray[i].nativeElement as HTMLElement;
      const firstRect = html.getBoundingClientRect();
      if (this.isRectToRect(firstRect, secondRect)) {
        (html.firstChild as HTMLElement).style.backgroundColor = '#2a2d32';
      } else {
        (html.firstChild as HTMLElement).style.backgroundColor = null;
      }
    }
  }

  isRectToRect(firstRect: DOMRect, secondRect: DOMRect) {
    return (firstRect.x < secondRect.x + secondRect.width) &&
      (secondRect.x < (firstRect.x + firstRect.width)) &&
      (firstRect.y < secondRect.y + secondRect.height) &&
      (secondRect.y < (firstRect.y + firstRect.height));
  }


}
