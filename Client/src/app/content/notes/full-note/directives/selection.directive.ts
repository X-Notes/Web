import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';
import { ScrollEvent } from 'muuri';
import { fromEvent, Subscription } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { buffer } from 'stream/consumers';
import { ApiBrowserTextService } from '../../api-browser-text.service';
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

  listeners = [];

  x;

  y;

  finX;

  finY;

  isFullNote = false;

  isMouseDown = false;

  startTop: number;

  private div: HTMLElement;

  mainContent: Element;

  moveEventSub: Subscription;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private selectionService: SelectionService,
    private clickableService: ClickableContentService,
    private pS: PersonalizationService,
  ) {}

  get subtractionScrollTopAndScrollStart() {
    return Math.abs(this.mainContent.scrollTop - this.startTop);
  }

  get isDivTransparent(): boolean {
    return this.div.style.opacity === '0';
  }

  get isDivActive(): boolean {
    if(!this.div) return false;
    const size = this.div.getBoundingClientRect();
    return (size.width > 5 && size.height > 5) && this.div.style.opacity === '1';
  } 

  @HostListener('mousedown', ['$event'])
  onClick() {
    this.isFullNote = true;
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    console.log('destroy');
    this.moveEventSub?.unsubscribe();
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  init() {
    this.div = this.renderer.createElement('div');
    this.div.classList.add('full-note-selection');

    this.mainContent = this.elementRef.nativeElement;
    this.mainContent.appendChild(this.div);

    const scrollEventListener = this.renderer.listen(this.mainContent, 'scroll', (e) =>
      this.scrollEvent(e),
    );
    this.listeners.push(scrollEventListener);

    const mousewheelEventListener = this.renderer.listen(this.mainContent, 'wheel', (e) =>
      this.mousewheelHandler(e),
    );
    this.listeners.push(mousewheelEventListener);

    const mouseDownListener = this.renderer.listen(document, 'mousedown', (e: MouseEvent) =>
      this.mouseDown(e),
    );
    const mouseUpListener = this.renderer.listen(document, 'mouseup', (e: MouseEvent) =>
      this.mouseUp(e),
    );

    const mouseMoveListener = this.renderer.listen(document, 'mousemove', (e: MouseEvent) => {  });
    this.listeners.push(mouseMoveListener);

    this.moveEventSub = fromEvent(document, 'mousemove')
      .pipe(bufferTime(20))
      .subscribe((events: MouseEvent[]) => {
        if(!events || events.length === 0) return;
        const last = events[events.length - 1];
        this.mouseMoveDelay(last);
      });

    this.listeners.push(mouseDownListener, mouseUpListener);
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
    if (
      (evt.target as HTMLElement).classList.contains('icon') ||
      (evt.target as HTMLElement).tagName === 'svg' ||
      (evt.target as HTMLElement).tagName === 'path' || 
      this.pS.isMobile() 
    ) {
      return;
    }

    const rectSize = this.div.getBoundingClientRect();
    if (rectSize.width === 0 || rectSize.height === 0) {
      rectSize.x = 0;
      rectSize.y = 0;
      this.selectionEvent.emit(rectSize);
    }

    this.isMouseDown = true;

    this.x = evt.pageX;
    this.y = evt.pageY;
    this.startTop = this.mainContent.scrollTop;

    this.setTop(this.y - this.selectionService.menuHeight + this.startTop);
    this.setLeft(this.x - this.selectionService.sidebarWidth);

    this.clickableService.reset();
    this.selectionStartEvent.emit(this.div.getBoundingClientRect());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseUp(evt) {
    this.isFullNote = false;
    this.isMouseDown = false;

    this.startTop = 0;

    this.setWidth(0);
    this.setHeight(0);

    this.selectionEndEvent.emit(this.div.getBoundingClientRect());
  }

  getNewValueY(): number {
    if (this.startTop !== this.mainContent.scrollTop) {
      return this.finY - this.y + this.mainContent.scrollTop - this.startTop;
    }
    return this.finY - this.y;
  }

  mouseMoveDelay(evt: MouseEvent) {
    if (this.isMouseDown && !this.selectionService.isResizingPhoto) {
      this.finX = evt.pageX;
      this.finY = evt.pageY;

      const newValueX = this.finX - this.x;
      const newValueY = this.getNewValueY();

      const newValueXabs = Math.abs(newValueX);
      const newValueYabs = Math.abs(newValueY);

      if (newValueY < 0 && newValueX > 0) {
        const top =
          evt.pageY -
          this.selectionService.menuHeight +
          this.startTop -
          this.subtractionScrollTopAndScrollStart;
        this.setTop(top);
      } else if (newValueY > 0 && newValueX < 0) {
        const left = evt.pageX - this.selectionService.sidebarWidth;
        this.setLeft(left);
      } else if (newValueY < 0 && newValueX < 0) {
        const top =
          evt.pageY -
          this.selectionService.menuHeight +
          this.startTop -
          this.subtractionScrollTopAndScrollStart;
        this.setTop(top);
        const left = evt.pageX - this.selectionService.sidebarWidth;
        this.setLeft(left);
      } else {
        this.setTop(this.y - this.selectionService.menuHeight + this.startTop);
        this.setLeft(this.x - this.selectionService.sidebarWidth);
      }

      this.setWidth(newValueXabs);
      this.setHeight(newValueYabs);

      this.selectionEvent.emit(this.div.getBoundingClientRect());
    }
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
  scrollEvent(e: ScrollEvent) {
    if (this.isFullNote) {
      let newValueY = 0;
      if (this.startTop !== this.mainContent.scrollTop) {
        newValueY = this.finY - this.y + this.mainContent.scrollTop - this.startTop;
      } else {
        newValueY = this.finY - this.y;
      }
      if (newValueY > 0) {
        this.setHeight(newValueY);
      } else {
        this.setTop(
          this.finY -
            this.selectionService.menuHeight +
            this.startTop -
            this.subtractionScrollTopAndScrollStart,
        );
        this.setHeight(Math.abs(newValueY));
      }
    }
  }
}
