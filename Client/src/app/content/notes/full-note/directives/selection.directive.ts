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
import { SelectionService } from '../content-editor-services/selection.service';

@Directive({
  selector: '[appSelection]',
})
export class SelectionDirective implements OnDestroy, OnInit {
  @Output()
  selectionEvent = new EventEmitter<DOMRect>();

  @Output()
  selectionStartEvent = new EventEmitter<DOMRect>();

  listeners = [];

  x;

  y;

  finX;

  finY;

  isFullNote = false;

  startTop: number;

  div: HTMLElement;

  mainContent: Element;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private selectionService: SelectionService,
  ) {}

  @HostListener('mousedown', ['$event'])
  onClick() {
    this.isFullNote = true;
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
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

    const mouseDownListener = this.renderer.listen('document', 'mousedown', (e) =>
      this.mouseDown(e),
    );
    const mouseUpListener = this.renderer.listen('document', 'mouseup', (e) => this.mouseUp(e));
    const mouseMoveListener = this.renderer.listen('document', 'mousemove', (e) =>
      this.mouseMove(e),
    );
    this.listeners.push(mouseDownListener, mouseMoveListener, mouseUpListener);
  }

  mousewheelHandler(e: WheelEvent): boolean | void {
    if (this.selectionService.isResizingPhoto) {
      e.preventDefault(); // lock scroll when changing height
    }
  }

  mouseDown(evt: MouseEvent) {
    if (
      (evt.target as HTMLElement).classList.contains('icon') ||
      (evt.target as HTMLElement).tagName === 'svg' ||
      (evt.target as HTMLElement).tagName === 'path'
    ) {
      return;
    }

    const rectSize = this.div.getBoundingClientRect();
    if (rectSize.width === 0 || rectSize.height === 0) {
      rectSize.x = 0;
      rectSize.y = 0;
      this.selectionEvent.emit(rectSize);
    }

    this.x = evt.pageX;
    this.y = evt.pageY;
    this.startTop = this.mainContent.scrollTop;
    this.div.style.top = `${this.y - this.selectionService.menuHeight + this.startTop}px`;
    this.div.style.left = `${this.x - this.selectionService.sidebarWidth}px`;

    this.selectionService.ismousedown = true;
    this.selectionStartEvent.emit(this.div.getBoundingClientRect());
  }

  mouseUp(evt) {
    this.isFullNote = false;
    this.selectionService.ismousedown = false;
    this.startTop = 0;

    this.div.style.width = `${0}px`;
    this.div.style.height = `${0}px`;
  }

  mouseMove(evt) {
    if (
      this.selectionService.ismousedown &&
      this.isFullNote &&
      !this.selectionService.isResizingPhoto
    ) {
      this.finX = evt.pageX;
      this.finY = evt.pageY;
      const newValueX = this.finX - this.x;

      let newValueY = 0;
      if (this.startTop !== this.mainContent.scrollTop) {
        newValueY = this.finY - this.y + this.mainContent.scrollTop - this.startTop;
      } else {
        newValueY = this.finY - this.y;
      }

      if (newValueY < 0 && newValueX > 0) {
        this.div.style.top = `${
          evt.pageY -
          this.selectionService.menuHeight +
          this.startTop -
          this.subtractionScrollTopAndScrollStart
        }px`;
      } else if (newValueY > 0 && newValueX < 0) {
        this.div.style.left = `${evt.pageX - this.selectionService.sidebarWidth}px`;
      } else if (newValueY < 0 && newValueX < 0) {
        this.div.style.top = `${
          evt.pageY -
          this.selectionService.menuHeight +
          this.startTop -
          this.subtractionScrollTopAndScrollStart
        }px`;
        this.div.style.left = `${evt.pageX - this.selectionService.sidebarWidth}px`;
      }
      this.div.style.width = `${Math.abs(newValueX)}px`;
      this.div.style.height = `${Math.abs(newValueY)}px`;

      this.selectionEvent.emit(this.div.getBoundingClientRect());
    }
  }

  get subtractionScrollTopAndScrollStart() {
    return Math.abs(this.mainContent.scrollTop - this.startTop);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollEvent(e: ScrollEvent) {
    if (this.selectionService.ismousedown && this.isFullNote) {
      let newValueY = 0;
      if (this.startTop !== this.mainContent.scrollTop) {
        newValueY = this.finY - this.y + this.mainContent.scrollTop - this.startTop;
      } else {
        newValueY = this.finY - this.y;
      }

      if (newValueY > 0) {
        this.div.style.height = `${newValueY}px`;
      } else {
        this.div.style.top = `${
          this.finY -
          this.selectionService.menuHeight +
          this.startTop -
          this.subtractionScrollTopAndScrollStart
        }px`;
        this.div.style.height = `${Math.abs(newValueY)}px`;
      }
    }
  }
}
