import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appDrop]',
})
export class DropDirective {

  @Input() appDrop: string; // class that can be active
  
  @Output() fileDropped = new EventEmitter<File[]>();

  @Output() dragOverEvent = new EventEmitter();

  @Output() dragLeaveEvent = new EventEmitter();

  @HostBinding('class') get fileOver(): string {
    return this.isActive ? this.appDrop : null;
  }

  isActive = false;

  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isActive = true;
    this.dragOverEvent.emit();
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isActive = false;
    this.dragLeaveEvent.emit();
  }

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isActive = false;
    const { files } = evt.dataTransfer;
    if (files.length > 0) {
      this.fileDropped.emit([...files]);
    }
  }
}
