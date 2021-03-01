import { ElementRef, EventEmitter, Injectable, } from '@angular/core';
import { BaseText, ContentType, } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { TransformContent } from '../../models/transform-content';
import { HtmlService } from './html.service';

@Injectable()
export class NumberListService extends HtmlService {

    transformTo = new EventEmitter<TransformContent>();

    setFocus($event: any, contentHtml: ElementRef<any>) {
        this.getNativeElement(contentHtml).focus();
    }

    setFocusToEnd(contentHtml: ElementRef<any>) {
        this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
    }

    onInput(content: BaseText, contentHtml: ElementRef) {
        content.content = this.getNativeElement(contentHtml).innerText;
    }

    onBlur(e: any) {
        // BLUR HANDLER
    }

    pasteCommandHandler(e: any) {
        throw new Error('Method not implemented.');
    }

    onSelectStart(e: any) {
        // SELECTIION
    }

    enter($event: any, content: BaseText, contentHtml: ElementRef, enterEvent: EventEmitter<EnterEvent>) {
        $event.preventDefault();
        if (this.isContentEmpty(contentHtml)) {
            this.transformTo.emit({id: content.id, contentType: ContentType.DEFAULT});
        } else {
            const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
            content.content = this.getNativeElement(contentHtml).innerText;
            const event = super.eventEventFactory(content.id, breakModel, ContentType.NUMBERLIST);
            enterEvent.emit(event);
        }
    }

    backDown($event, content: BaseText, contentHtml: ElementRef,
             concatThisWithPrev: EventEmitter<string>, deleteThis: EventEmitter<string>) {
        super.backDown($event, content, contentHtml, concatThisWithPrev, deleteThis);
    }

    backUp(e: any) {

    }

}
