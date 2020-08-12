import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHammer]'
})
export class HammerDirective {

  constructor(el: ElementRef) {
    console.log(el);
  }

  @HostListener('tap',  ['$event'])
  onTap(e) {
    console.log(e);
  }

}
