import { Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2 } from '@angular/core';

export interface SelectionEvent {

}

@Directive({
  selector: '[appSelection]'
})
export class SelectionDirective {

  @Output()
  selectionEvent = new EventEmitter<number>();

  menuHeight = 49;
  sidebarWidth = 270;

  x;
  y;
  finX;
  finY;
  ismousedown = false;
  isFullNote = false;
  startTop: number;

  div: any;
  mainContent: Element;


  constructor(private elementRef: ElementRef, private renderer: Renderer2) {

    setTimeout(() => this.init(), 1000);
  }

  init() {
    this.div = this.renderer.createElement('div');
    this.div.classList.add('full-note-selection');

    this.mainContent = document.getElementsByClassName('main-content')[0];
    this.mainContent.appendChild(this.div);

    this.mainContent.addEventListener('scroll', (e) => this.scrollEvent(e));

    document.addEventListener('mousedown', (e) => this.mouseDown(e));
    document.addEventListener('mouseup', (e) => this.mouseUp(e));
    document.addEventListener('mousemove', (e) => this.mouseMove(e));
  }

  @HostListener('mousedown', ['$event'])
  onClick(event) {
    this.isFullNote = true;
  }

  mouseDown(evt) {

    this.x = evt.pageX;
    this.y = evt.pageY;
    this.startTop = this.mainContent.scrollTop;
    this.div.style.top = (this.y - this.menuHeight + this.startTop) + 'px';
    this.div.style.left = (this.x - this.sidebarWidth) + 'px';

    this.ismousedown = true;
  }

  mouseUp(evt) {
    this.isFullNote = false;
    this.ismousedown = false;
    this.startTop = 0;

    this.div.style.width = 0 + 'px';
    this.div.style.height = 0 + 'px';
  }

  mouseMove(evt) {
    if (this.ismousedown && this.isFullNote) {
      this.finX = evt.pageX;
      this.finY = evt.pageY;
      const newValueX = (this.finX - this.x);

      let newValueY = 0;
      if (this.startTop !== this.mainContent.scrollTop) {
        newValueY = (this.finY - this.y + this.mainContent.scrollTop - this.startTop);
      } else {
        newValueY = (this.finY - this.y);
      }

      this.div.style.width = newValueX + 'px';
      this.div.style.height = newValueY + 'px';

      console.log('x', this.div.style.top);
      console.log('y', this.div.style.left);
      console.log('width', this.div.style.width);
      console.log('height', this.div.style.height);
      this.selectionEvent.emit(5);
    }
  }

  scrollEvent(e) {
    if (this.ismousedown && this.isFullNote) {

      let newValueY = 0;
      if (this.startTop !== this.mainContent.scrollTop) {
        newValueY = (this.finY - this.y + this.mainContent.scrollTop - this.startTop);
      } else {
        newValueY = (this.finY - this.y);
      }

      this.div.style.height = newValueY + 'px';
    }
  }
}
