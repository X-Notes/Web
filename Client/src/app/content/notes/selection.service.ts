import { ElementRef, Injectable, QueryList } from '@angular/core';

@Injectable()
export class SelectionService {

  isSelectionInside;

  constructor() { }

  selectionHandler(secondRect: DOMRect, refElements: QueryList<ElementRef>) {
    const refElementsArray = refElements.toArray();
    const length = refElementsArray.length - 1;

    const itemsSelect: HTMLElement[] = [];
    const itemsNoSelect: HTMLElement[] = [];

    for (let i = 0 ; i < length; i++) {
      const html = refElementsArray[i].nativeElement as HTMLElement;
      const firstRect = html.getBoundingClientRect();
      if (this.isRectToRect(firstRect, secondRect)) {
        itemsSelect.push(html.firstChild as HTMLElement);
      } else {
        itemsNoSelect.push(html.firstChild as HTMLElement);
      }
    }
    this.makeSelect(itemsSelect);
    this.makeNoSelect(itemsNoSelect);
  }

  makeSelect(refElements: HTMLElement[])
  {
    if (this.isSelectionInside)
    {
      if (refElements.length === 1)
      {
        refElements[0].style.backgroundColor = null;
        return;
      }else{
        window.getSelection().empty();
      }
    }
    for (const elem of refElements)
    {
      elem.style.backgroundColor = '#2a2d32';
    }
  }

  makeNoSelect(refElements: HTMLElement[])
  {
    for (const elem of refElements)
    {
      elem.style.backgroundColor = null;
    }
  }


  isSelectionInZone(secondRect: DOMRect, refElements: QueryList<ElementRef>) {
    const refElementsArray = refElements.toArray();
    const length = refElementsArray.length - 1;
    for (let i = 0 ; i < length; i++) {
      const html = refElementsArray[i].nativeElement as HTMLElement;
      const firstRect = html.getBoundingClientRect();
      if (this.isRectToRect(firstRect, secondRect)) {
        return true;
      }
    }
    return false;
  }

  isRectToRect(firstRect: DOMRect, secondRect: DOMRect) {
    return (firstRect.x < secondRect.x + secondRect.width) &&
      (secondRect.x < (firstRect.x + firstRect.width)) &&
      (firstRect.y < secondRect.y + secondRect.height) &&
      (secondRect.y < (firstRect.y + firstRect.height));
  }


}
