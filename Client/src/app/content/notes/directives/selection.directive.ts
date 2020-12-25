import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSelection]'
})
export class SelectionDirective {

  menuHeight = 49;
  sidebarWidth = 270;
  x;
  y;
  finX;
  finY;
  div: any;
  mainContent: Element;
  ismousedown = false;
  isFullNote = false;
  lastScrollNumber: number;
  prevScrollValue = 0;

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
    this.div.style.top = (this.y - this.menuHeight + this.mainContent.scrollTop) + 'px';
    this.div.style.left = (this.x - this.sidebarWidth) + 'px';

    this.ismousedown = true;
  }

  mouseUp(evt) {
    this.isFullNote = false;
    this.ismousedown = false;
    this.div.style.width = 0 + 'px';
    this.div.style.height = 0 + 'px';
  }

  mouseMove(evt) {
    if (this.ismousedown && this.isFullNote) {
      this.finX = evt.pageX;
      this.finY = evt.pageY;
      const newValueX = (this.finX - this.x);
      const newValueY = (this.finY - this.y + this.mainContent.scrollTop - this.prevScrollValue);

      this.div.style.width = newValueX + 'px';
      this.div.style.height = newValueY + 'px';
    }
  }

  scrollEvent(e) {
    if (!this.ismousedown)
    {
      this.prevScrollValue = this.mainContent.scrollTop;
    }
    const newValueY = (this.finY - this.y + this.mainContent.scrollTop - this.prevScrollValue);
    this.div.style.height = newValueY + 'px';
  }
}
