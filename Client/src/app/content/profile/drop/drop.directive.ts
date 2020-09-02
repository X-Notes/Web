import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appDrop]'
})
export class DropDirective {

  constructor() { }

  @HostBinding('class.new-photo') fileOver: boolean;

  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }
}
