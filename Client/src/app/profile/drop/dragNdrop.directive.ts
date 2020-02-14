import { Directive, HostBinding, HostListener, Output, EventEmitter } from '@angular/core';


@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[dragNdrop]',
})

export class DragNDropDirective {

    @Output() FileDrop = new EventEmitter<any>();

    @HostBinding('style.background-color') back = '#fff';
    @HostBinding('style.box-shadow') shadow = 'none';
    @HostBinding('style.border') border = '0.5px solid white';

    @HostListener('dragover', ['$event']) dragOver(target) {
        target.preventDefault();
        target.stopPropagation();
        this.back = '#FCFCFC';
        this.shadow = 'inset 0px 0px 5px rgba(41, 151, 255, 0.25)';
        this.border = '0.5px dashed #2997FF';
    }
    @HostListener('dragleave', ['$event']) dragLeave(target) {
        target.preventDefault();
        target.stopPropagation();
        this.back = '#fff';
        this.shadow = 'none';
        this.border = '0.5px dashed white';
    }
    @HostListener('drop', ['$event']) dragDrop(target) {
        target.preventDefault();
        target.stopPropagation();
        this.back = '#fff';
        this.shadow = 'none';
        this.border = '0.5px dashed white';
        const files = target.dataTransfer.files;
        this.FileDrop.emit(files);
    }
}
