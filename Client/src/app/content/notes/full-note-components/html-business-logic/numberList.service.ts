import { ElementRef, EventEmitter, Injectable, } from '@angular/core';
import { ContentModel, ContentType, NumberList } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { HtmlService } from './html.service';

@Injectable()
export class NumberListService extends HtmlService {

    transformToTextEvent = new EventEmitter<string>();

    setFocus($event: any, contentHtml: ElementRef<any>) {
        this.getNativeElement(contentHtml).focus();
    }

    setFocusToEnd(contentHtml: ElementRef<any>) {
        this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
    }

    onInput(content: ContentModel<NumberList>, contentHtml: ElementRef) {
        content.data.content = this.getNativeElement(contentHtml).innerText;
    }

    onBlur(e: any) {
        // BLUR HANDLER
    }

    pasteCommandHandler(e: any) {
        throw new Error('Method not implemented.');
    }

    mouseUp(e: any) {
        super.mouseUp(e);
    }

    onSelectStart(e: any) {
        // SELECTIION
    }

    enter($event: any, content: ContentModel<NumberList>, contentHtml: ElementRef, enterEvent: EventEmitter<EnterEvent>) {
        $event.preventDefault();
        if (this.isContentEmpty(contentHtml)) {
            this.transformToTextEvent.emit(content.contentId);
        }else{
            const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
            content.data.content = this.getNativeElement(contentHtml).innerText;
            const event = super.eventEventFactory(content.contentId, breakModel, ContentType.NUMBERLIST);
            enterEvent.emit(event);
        }
    }

    backDown(e: any) {
        throw new Error('Method not implemented.');
    }

    backUp(e: any) {
        throw new Error('Method not implemented.');
    }

}
