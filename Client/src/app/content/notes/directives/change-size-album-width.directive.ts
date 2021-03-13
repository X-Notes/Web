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
  selector: '[appChangeSizeAlbumWidth]',
})
export class ChangeSizeAlbumWidthDirective implements OnInit, OnDestroy {
  listeners = [];

  @Output()
  mouseClick = new EventEmitter();

  @Output()
  changeWeight = new EventEmitter<number>();

  startX: number;

  isChangeSizeMode = false;

  constructor(private renderer: Renderer2) {}

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  ngOnInit(): void {
    const mouseUpListener = this.renderer.listen('document', 'mouseup', (e) =>
      this.mouseupHandler(e),
    );
    const mouseMoveListener = this.renderer.listen('document', 'mousemove', (e) =>
      this.mousemoveHandler(e),
    );
    this.listeners.push(mouseMoveListener, mouseUpListener);
  }

  @HostListener('mousedown', ['$event'])
  mousedownHandler(event: MouseEvent) {
    this.startX = event.clientX;
    this.isChangeSizeMode = true;
    this.mouseClick.emit();
  }

  mouseupHandler(event: MouseEvent) {
    this.isChangeSizeMode = false;
    this.mouseClick.emit();
  }

  mousemoveHandler(event: MouseEvent) {
    if (this.isChangeSizeMode) {
      this.changeWeight.emit(event.clientX - this.startX);
    }
  }
}
