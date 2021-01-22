import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, CheckedList, ContentModel, ContentType, HtmlText } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { TransformContent } from '../../models/transform-content';
import { HtmlService } from './html.service';



@Injectable()
export class CheckListService extends HtmlService {

    transformTo = new EventEmitter<TransformContent>();

    setFocus($event: any, contentHtml: ElementRef<any>) {
        this.getNativeElement(contentHtml).focus();
    }
    setFocusToEnd(contentHtml: ElementRef<any>) {
        this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
    }

    onInput(content: ContentModel<CheckedList>, contentHtml: ElementRef) {
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

    enter($event: any, content: ContentModel<CheckedList>, contentHtml: ElementRef, enterEvent: EventEmitter<EnterEvent>) {
        $event.preventDefault();
        if (this.isContentEmpty(contentHtml)) {
            this.transformTo.emit({id: content.contentId, type: ContentType.TEXT});
        }else{
            const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
            content.data.content = this.getNativeElement(contentHtml).innerText;
            const event = super.eventEventFactory(content.contentId, breakModel, ContentType.CHECKLIST);
            enterEvent.emit(event);
        }
    }

    backDown($event, content: ContentModel<BaseText>, contentHtml: ElementRef,
             concatThisWithPrev: EventEmitter<string>, deleteThis: EventEmitter<string>) {
        super.backDown($event, content, contentHtml, concatThisWithPrev, deleteThis);
    }

    backUp(e: any) {

    }

}
