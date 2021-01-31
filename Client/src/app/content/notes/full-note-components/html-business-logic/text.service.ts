import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, ContentModel, ContentType, HtmlText } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { HtmlService } from './html.service';

@Injectable()
export class TextService extends HtmlService {

    isLast: boolean;

    onInput(content: ContentModel<HtmlText>, contentHtml: ElementRef, addToEndNewText?: EventEmitter<any>) {
        content.data.content = this.getNativeElement(contentHtml).innerText;
        if (this.isLast){
            addToEndNewText.emit();
            this.isLast = false;
        }
    }

    onBlur(e: any) {
        // BLUR HANDLER
    }

    pasteCommandHandler(e: any) {
        super.pasteCommandHandler(e);
    }

    onSelectStart(e: any) {
        // SELECTIION
    }

    enter($event: any, content: ContentModel<HtmlText>, contentHtml: ElementRef, enterEvent: EventEmitter<EnterEvent>) {
        $event.preventDefault();
        const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
        content.data.content = this.getNativeElement(contentHtml).innerText;
        const event = super.eventEventFactory(content.contentId, breakModel, ContentType.TEXT);
        enterEvent.emit(event);
    }

    backDown($event, content: ContentModel<BaseText>, contentHtml: ElementRef,
             concatThisWithPrev: EventEmitter<string>, deleteThis: EventEmitter<string>) {
        super.backDown($event, content, contentHtml, concatThisWithPrev, deleteThis);
    }

    backUp(e: any) {

    }

    setFocus($event, contentHtml: ElementRef) {
        this.getNativeElement(contentHtml).focus();
    }

    setFocusToEnd(contentHtml: ElementRef) {
        this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
    }
}
