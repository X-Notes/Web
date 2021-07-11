import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollControl]',
})
export class ScrollControlDirective {
  constructor(private elementRef: ElementRef, private renderer: Renderer2) {
    this.renderer.addClass(this.elementRef.nativeElement, 'hide-scroll');
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.removeClass(this.elementRef.nativeElement, 'hide-scroll');
    this.renderer.addClass(this.elementRef.nativeElement, 'visible-scroll');
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.removeClass(this.elementRef.nativeElement, 'visible-scroll');
    this.renderer.addClass(this.elementRef.nativeElement, 'hide-scroll');
  }
}
