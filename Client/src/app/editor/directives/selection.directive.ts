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
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';
import { bufferTime } from 'rxjs/operators';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ClickableContentService } from '../ui-services/clickable-content.service';
import { SelectionService } from '../ui-services/selection.service';
import { EditorOptions } from '../entities-ui/editor-options';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { DrawerCoordsConfig } from '../entities-ui/selection/drawer-coords';

@Directive({
  selector: '[appSelection]',
})
export class SelectionDirective implements OnDestroy, OnInit {
  @Output()
  selectionStartEvent = new EventEmitter<DrawerCoordsConfig>();

  @Output()
  selectionEndEvent = new EventEmitter<DrawerCoordsConfig>();

  @Output()
  changeDrawerCoordsEvent = new EventEmitter<DrawerCoordsConfig>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onScrollEvent = new EventEmitter<Event>();

  @Input() editorOptions$: BehaviorSubject<EditorOptions>;

  listeners = [];

  x: number;

  y: number;

  isMouseDown = false;

  startTop: number;

  startLeft: number;

  mainContent: HTMLElement;

  moveEventSub: Subscription;

  scrollSection: HTMLElement;

  header: HTMLElement;

  private prevMouseEvent: MouseEvent;

  private coords: DrawerCoordsConfig = { top: 0, left: 0, width: 0, height: 0, x: 0, y: 0 };

  constructor(
    elementRef: ElementRef,
    private renderer: Renderer2,
    private selectionService: SelectionService,
    private clickableService: ClickableContentService,
    private pS: PersonalizationService,
    private store: Store,
  ) {
    this.mainContent = elementRef.nativeElement;
  }

  get isSelectionActive(): boolean {
    // when the user starts to do select, the dom element that handles select is resized, e.g. rectangle, 5, so that random clicks are not handled accidentally
    return (this.coords?.height > 15 && this.coords?.width > 3) || (this.coords?.width > 15 && this.coords?.height > 3);
  }

  get headerHeight(): number {
    if (!this.header) {
      this.header = document.getElementById('app-header');
    }
    return this.header.offsetHeight;
  }

  processY(y: number): number {
    return y + this.scrollSection.scrollTop - this.scrollSection.offsetTop - this.headerHeight;
  }

  processX(x: number): number {
    return x - this.selectionService.sidebarWidth;
  }

  ngOnInit(): void {
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
      // e.preventDefault();
      if (this.editorOptions$.getValue().isReadOnlyMode || this.store.selectSnapshot(AppStore.IsMuuriDragging)) {
        return true;
      }
      return this.mouseDown(e);
    });
    const mouseUpListener = this.renderer.listen(document, 'mouseup', (e: MouseEvent) => {
      if (this.editorOptions$.getValue().isReadOnlyMode || this.store.selectSnapshot(AppStore.IsMuuriDragging)) {
        return true;
      }
      return this.mouseUp(e);
    });

    this.moveEventSub = fromEvent(document, 'mousemove')
      .pipe(bufferTime(20))
      .subscribe((events: MouseEvent[]) => {
        if (this.editorOptions$.getValue().isReadOnlyMode || this.store.selectSnapshot(AppStore.IsMuuriDragging)) {
          return true;
        }
        if (!events || events.length === 0) return;
        const last = events[events.length - 1];
        this.mouseMoveDelay(last);
      });

    this.listeners.push(mouseDownListener, mouseUpListener);
  }

  initSelectionDrawer(scrollSection: HTMLElement): void {
    this.scrollSection = scrollSection;

    const scrollEventListener = this.renderer.listen(scrollSection, 'scroll', (e) =>
      this.scrollEvent(e),
    );
    this.listeners.push(scrollEventListener);

    const mousewheelEventListener = this.renderer.listen(scrollSection, 'wheel', (e) =>
      this.mousewheelHandler(e),
    );
    this.listeners.push(mousewheelEventListener);
  }

  mousewheelHandler(e: WheelEvent): boolean | void {
    if (this.selectionService.isResizingPhoto$.getValue()) {
      e.preventDefault(); // lock scroll when changing height
    }
  }

  mouseDown(evt: MouseEvent) {
    this.selectionService.resetSelectedItems();
    const isBackdropActive = document.getElementsByClassName('cdk-overlay-backdrop')[0]; // handle mat-menu
    if (
      (evt.target as HTMLElement).classList.contains('icon') ||
      (evt.target as HTMLElement).tagName === 'svg' ||
      (evt.target as HTMLElement).tagName === 'path' ||
      (evt.target as HTMLElement).localName === 'mat-icon' ||
      evt.target === this.scrollSection || // scroll click
      this.pS.isMobile() ||
      this.pS.isDialogActive$.getValue() ||
      !!isBackdropActive
    ) {
      return;
    }

    this.prevMouseEvent = evt;
    this.x = 0;
    this.y = 0;
    this.isMouseDown = true;

    this.x = evt.pageX;
    this.y = evt.pageY;

    this.startTop = this.processY(this.y);
    this.startLeft = this.processX(this.x);

    this.setTop(this.startTop);
    this.setLeft(this.startLeft);
    this.coords = {... this.coords, x: this.x, y: this.y };

    this.clickableService.reset();

    this.selectionStartEvent.emit(this.coords);
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
    this.selectionService.updateSelectionValue(false);
    this.coords = { top: 0, left: 0, width: 0, height: 0, x: 0, y: 0 };
    this.selectionEndEvent.emit();
  }

  mouseMoveDelay(evt: MouseEvent) {
    if (
      !this.isMouseDown ||
      this.selectionService.isResizingPhoto$.getValue() ||
      this.selectionService.disableDiv$.getValue() ||
      this.pS.isDialogActive$.getValue()
    ) {
      return;
    }

    this.prevMouseEvent = evt;
    const newX = evt.pageX;
    const newY = evt.pageY;

    const newWidth = newX - this.x;
    const newHeight = this.processY(newY) - this.startTop;

    const newValueWidth = Math.abs(newWidth);
    const newValueHeight = Math.abs(newHeight);

    if (newHeight < 0 && newWidth > 0) { // right upper
      const top = this.processY(newY);
      this.setTop(top);
      this.setLeft(this.startLeft);
    } else if (newHeight > 0 && newWidth < 0) { // bottom left
      this.setTop(this.startTop);
      const left = this.processX(newX);
      this.setLeft(left);
    } else if (newHeight < 0 && newWidth < 0) { // left upper
      const top = this.processY(newY);
      this.setTop(top);
      const left = this.processX(newX);
      this.setLeft(left);
    } else { // bottom right
      this.setTop(this.startTop);
      this.setLeft(this.startLeft);
    }

    this.coords = {... this.coords, x: newX, y: newY };
    this.setWidth(newValueWidth);
    this.setHeight(newValueHeight);

    this.selectionService.updateSelectionValue(this.isSelectionActive);
    this.changeDrawerCoordsEvent.emit(this.coords);
  }

  resetDiv(): void {
    this.setTop(0);
    this.setLeft(0);
    this.setHeight(0);
    this.setWidth(0);
  }

  setTop(top: number): void {
    this.coords = {... this.coords, top };
  }

  setLeft(left: number): void {
    this.coords = {... this.coords, left };
  }

  setWidth(width: number): void {
    this.coords = {... this.coords, width };
  }

  setHeight(height: number): void {
    this.coords = {... this.coords, height };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  scrollEvent(e: Event): void {
    this.onScrollEvent.emit(e);
    this.mouseMoveDelay(this.prevMouseEvent);
  }
}
