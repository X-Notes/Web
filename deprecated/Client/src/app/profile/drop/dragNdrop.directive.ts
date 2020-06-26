import { Directive, HostBinding, HostListener, Output, EventEmitter } from '@angular/core';


@Directive({
    // tslint:disable-next-line: directive-selector
    selector: '[dragNdrop]',
})

export class DragNDropDirective {

    @Output() FileDrop = new EventEmitter<any>();

    @HostBinding('class.plus-hover') isActive = false;
    @HostBinding('style.background-color') back = '#fff';
    @HostBinding('style.box-shadow') shadow = 'none';
    @HostBinding('style.border') border = '0.5px solid white';

    @HostListener('dragover', ['$event']) dragOver(target) {
        this.isActive = true;
        target.preventDefault();
        target.stopPropagation();
        this.back = '#FCFCFC';
        this.shadow = 'inset 0px 0px 5px rgba(41, 151, 255, 0.25)';
        this.border = '0.5px dashed #2997FF';
        console.log(this.isActive);
    }
    @HostListener('dragleave', ['$event']) dragLeave(target) {
        this.isActive = false;
        target.preventDefault();
        target.stopPropagation();
        this.back = '#fff';
        this.shadow = 'none';
        this.border = '0.5px dashed white';
        console.log(this.isActive);
    }
    @HostListener('drop', ['$event']) dragDrop(target) {
        this.isActive = false;
        target.preventDefault();
        target.stopPropagation();
        this.back = '#fff';
        this.shadow = 'none';
        this.border = '0.5px dashed white';
        const files = target.dataTransfer.files;
        this.FileDrop.emit(files);
        console.log(this.isActive);
    }
}
