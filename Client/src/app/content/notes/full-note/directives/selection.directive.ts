import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { ScrollEvent } from 'muuri';
import { fromEvent, Subscription } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ClickableContentService } from '../content-editor-services/clickable-content.service';
import { SelectionService } from '../content-editor-services/selection.service';

@Directive({
  selector: '[appSelection]',
})
export class SelectionDirective implements OnDestroy, OnInit {
  @Output()
  selectionEvent = new EventEmitter<DOMRect>();

  @Output()
  selectionStartEvent = new EventEmitter<DOMRect>();

  @Output()
  selectionEndEvent = new EventEmitter<DOMRect>();

  @Input() isReadonly: boolean;

  listeners = [];

  x;

  y;

  isMouseDown = false;

  startTop: number;

  startLeft: number;

  mainContent: HTMLElement;

  moveEventSub: Subscription;

  scrollSection: HTMLElement;

  private div: HTMLElement;

  private prevMouseEvent: MouseEvent;

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private selectionService: SelectionService,
    private clickableService: ClickableContentService,
    private pS: PersonalizationService,
  ) {
    this.mainContent = elementRef.nativeElement;
  }

  get isDivTransparent(): boolean {
    return this.div.style.opacity === '0';
  }

  get isDivActive(): boolean {
    if (!this.div) return false;
    const size = this.div.getBoundingClientRect();
    return size.width > 5 && size.height > 5 && this.div.style.opacity === '1';
  }

  processY(y: number): number {
    return (
      y +
      this.scrollSection.scrollTop -
      this.scrollSection.offsetTop -
      this.selectionService.menuHeight
    );
  }

  processX(x: number): number {
    return x - this.selectionService.sidebarWidth - 5;
  }

  ngOnInit(): void {
    if (this.isReadonly) return;
    this.initMouseHandlers();
  }

  ngOnDestroy(): void {
    console.log('destroy');
    this.moveEventSub?.unsubscribe();
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  initMouseHandlers(): void {
    const mouseDownListener = this.renderer.listen(document, 'mousedown', (e: MouseEvent) => {
      return this.mouseDown(e);
    });
    const mouseUpListener = this.renderer.listen(document, 'mouseup', (e: MouseEvent) => {
      return this.mouseUp(e);
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mouseMoveListener = this.renderer.listen(document, 'mousemove', (e: MouseEvent) => {});
    this.listeners.push(mouseMoveListener);

    this.moveEventSub = fromEvent(document, 'mousemove')
      .pipe(bufferTime(20))
      .subscribe((events: MouseEvent[]) => {
        if (!events || events.length === 0) return;
        const last = events[events.length - 1];
        this.mouseMoveDelay(last);
      });

    this.listeners.push(mouseDownListener, mouseUpListener);
  }

  initSelectionDrawer(scrollSection: HTMLElement): void {
    this.scrollSection = scrollSection;
    this.div = document.getElementById('note-selector');

    const scrollEventListener = this.renderer.listen(scrollSection, 'scroll', (e) =>
      this.scrollEvent(e, scrollSection),
    );
    this.listeners.push(scrollEventListener);

    const mousewheelEventListener = this.renderer.listen(scrollSection, 'wheel', (e) =>
      this.mousewheelHandler(e),
    );
    this.listeners.push(mousewheelEventListener);
  }

  mousewheelHandler(e: WheelEvent): boolean | void {
    if (this.selectionService.isResizingPhoto) {
      e.preventDefault(); // lock scroll when changing height
    }
  }

  setIsShowDiv(isShow: boolean): void {
    if (isShow) {
      this.div.style.opacity = '1';
    } else {
      this.div.style.opacity = '0';
    }
  }

  mouseDown(evt: MouseEvent) {
    this.selectionService.resetSelectionItems();
    if (
      (evt.target as HTMLElement).classList.contains('icon') ||
      (evt.target as HTMLElement).tagName === 'svg' ||
      (evt.target as HTMLElement).tagName === 'path' ||
      (evt.target as HTMLElement).localName === 'mat-icon' ||
      this.pS.isMobile()
    ) {
      return;
    }

    this.prevMouseEvent = evt;
    this.x = 0;
    this.y = 0;
    this.isMouseDown = true;

    const rectSize = this.div.getBoundingClientRect();
    if (rectSize.width === 0 || rectSize.height === 0) {
      rectSize.x = 0;
      rectSize.y = 0;
      this.selectionEvent.emit(rectSize);
    }

    this.x = evt.pageX;
    this.y = evt.pageY;

    this.startTop = this.processY(this.y);
    this.startLeft = this.processX(this.x);

    this.setTop(this.startTop);
    this.setLeft(this.startLeft);

    this.clickableService.reset();
    this.selectionStartEvent.emit(this.div.getBoundingClientRect());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseUp(evt: MouseEvent) {
    this.prevMouseEvent = evt;
    this.isMouseDown = false;
    this.startTop = 0;
    this.startLeft = 0;
    this.x = 0;
    this.y = 0;
    this.resetDiv();
    this.selectionEndEvent.emit(this.div.getBoundingClientRect());
  }

  mouseMoveDelay(evt: MouseEvent) {
    if (!this.isMouseDown || this.selectionService.isResizingPhoto) {
      return;
    }

    this.prevMouseEvent = evt;
    const newX = evt.pageX;
    const newY = evt.pageY;

    const newWidth = newX - this.x;
    const newHeight = this.processY(newY) - this.startTop;

    const newValueWidth = Math.abs(newWidth);
    const newValueHeight = Math.abs(newHeight);

    if (newHeight < 0 && newWidth > 0) {
      const top = this.processY(newY);
      this.setTop(top);
    } else if (newHeight > 0 && newWidth < 0) {
      this.setTop(this.startTop);
      const left = this.processX(newX);
      this.setLeft(left);
    } else if (newHeight < 0 && newWidth < 0) {
      const top = this.processY(newY);
      this.setTop(top);
      const left = this.processX(newX);
      this.setLeft(left);
    } else {
      this.setTop(this.startTop);
      this.setLeft(this.startLeft);
    }

    this.setWidth(newValueWidth);
    this.setHeight(newValueHeight);

    this.selectionEvent.emit(this.div.getBoundingClientRect());
  }

  resetDiv(): void {
    this.setTop(0);
    this.setLeft(0);
    this.setHeight(0);
    this.setWidth(0);
  }

  setTop(top: number): void {
    this.div.style.top = `${top}px`;
  }

  setLeft(left: number): void {
    this.div.style.left = `${left}px`;
  }

  setWidth(width: number): void {
    this.div.style.width = `${width}px`;
  }

  setHeight(height: number): void {
    this.div.style.height = `${height}px`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollEvent(e: ScrollEvent, scrollSection: HTMLElement) {
    this.mouseMoveDelay(this.prevMouseEvent);
  }
}
