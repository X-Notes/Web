import {
  Directive,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appChangeSizeAlbumHeight]',
})
export class ChangeSizeAlbumHeightDirective implements OnInit, OnDestroy {
  @Output()
  mouseClick = new EventEmitter<boolean>();
  // true = down
  // false = up

  @Output()
  changeHeight = new EventEmitter<number>();

  listeners = [];

  startY: number;

  isChangeSizeMode = false;

  constructor(private renderer: Renderer2) {}

  @HostListener('mousedown', ['$event'])
  mousedownHandler(event: MouseEvent) {
    this.startY = event.clientY;
    this.isChangeSizeMode = true;
    this.mouseClick.emit(true);
  }

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  ngOnInit(): void {
    const mouseUpListener = this.renderer.listen('document', 'mouseup', (e) => {
      this.mouseupHandler();
      console.log(e);
    });
    const mouseMoveListener = this.renderer.listen('document', 'mousemove', (e) =>
      this.mousemoveHandler(e),
    );
    this.listeners.push(mouseMoveListener, mouseUpListener);
  }

  mouseupHandler() {
    this.isChangeSizeMode = false;
    this.mouseClick.emit(false);
  }

  mousemoveHandler(event: MouseEvent) {
    if (this.isChangeSizeMode) {
      this.changeHeight.emit(event.clientY - this.startY);
    }
  }
}
