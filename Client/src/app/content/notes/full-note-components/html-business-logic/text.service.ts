import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { ContentModel, ContentType, HtmlText } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { HtmlService } from './html.service';

@Injectable()
export class TextService extends HtmlService {

    visible = false;

    onInput(content: ContentModel<HtmlText>, contentHtml: ElementRef) {
        content.data.content = contentHtml.nativeElement.innerText;
        this.visible = this.isContentEmpty(contentHtml);
    }

    onBlur(e: any) {
        // BLUR HANDLER
    }

    pasteCommandHandler(e: any) {
        super.pasteCommandHandler(e);
    }

    mouseUp(e: any) {
        super.mouseUp(e);
    }

    onSelectStart(e: any) {
        // SELECTIION
    }

    enter($event: any, content: ContentModel<HtmlText>, contentHtml: ElementRef, enterEvent: EventEmitter<EnterEvent>) {
        $event.preventDefault();
        const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
        content.data.content = contentHtml.nativeElement.innerText;
        const event = super.eventEventFactory(content.contentId, breakModel, ContentType.TEXT);
        enterEvent.emit(event);
    }

    backDown(e: any) {
        throw new Error('Method not implemented.');
    }

    backUp(e: any) {
        throw new Error('Method not implemented.');
    }

    mouseEnter($event, contentHtml: ElementRef) {
        this.visible = true && this.isContentEmpty(contentHtml) && !this.selectionService.ismousedown;
    }

    mouseOut($event, contentHtml: ElementRef) {
        this.visible = (document.activeElement === this.getNativeElement(contentHtml)) && this.isContentEmpty(contentHtml);
    }

    setFocus($event, contentHtml: ElementRef) {
        this.getNativeElement(contentHtml).focus();
        this.visible = true && this.isContentEmpty(contentHtml);
    }

    setFocusToEnd(contentHtml: ElementRef) {
        this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
        this.visible = true && this.isContentEmpty(contentHtml);
    }

    focusOut()
    {
        this.visible = false;
        this.menuSelectionService.menuActive = false;
    }
}
