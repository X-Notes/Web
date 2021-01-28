import { Directive, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appChangeSizeAlbum]'
})
export class ChangeSizeAlbumDirective implements OnInit, OnDestroy {

  listeners = [];

  @Output()
  mouseClick = new EventEmitter();


  @Output()
  changeSize = new EventEmitter<number>();

  startY: number;
  isChangeSizeMode = false;

  constructor(private renderer: Renderer2) { }

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  ngOnInit(): void {
    const mouseUpListener = this.renderer.listen('document', 'mouseup', (e) => this.mouseupHandler(e));
    const mouseMoveListener = this.renderer.listen('document', 'mousemove', (e) => this.mousemoveHandler(e));
    this.listeners.push(mouseMoveListener, mouseUpListener);
  }

  @HostListener('mousedown', ['$event'])
  mousedownHandler(event: MouseEvent) {
    this.startY = event.clientY;
    this.isChangeSizeMode = true;
    this.mouseClick.emit();
  }


  mouseupHandler(event: MouseEvent) {
    this.isChangeSizeMode = false;
    this.mouseClick.emit();
  }

  mousemoveHandler(event: MouseEvent) {
    if (this.isChangeSizeMode)
    {
      this.changeSize.emit(event.clientY - this.startY);
    }
  }



}
