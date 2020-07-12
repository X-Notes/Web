import { Injectable } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/scrolling';

@Injectable({
  providedIn: 'root'
})

export class DragService {

  constructor(private viewportRuler: ViewportRuler) { }

  dragIndexOf(collection, node) {
    return Array.prototype.indexOf.call(collection, node);
  }

  dragIsTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return event.type.startsWith('touch');
  }

  dragIsInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
    const {top, bottom, left, right} = dropList.element.nativeElement.getBoundingClientRect();
    if ({top, bottom, left, right} !== undefined) {
      return y >= top && y <= bottom && x >= left && x <= right;
    } else {
      return false;
    }
  }

  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    const point = this.dragIsTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
            x: point.pageX - scrollPosition.left,
            y: point.pageY - scrollPosition.top
        };
  }
}
