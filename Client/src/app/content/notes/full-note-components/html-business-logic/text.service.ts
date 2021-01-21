import { ElementRef, Injectable } from '@angular/core';
import { ContentModel, HtmlText } from '../../models/ContentMode';
import { HtmlService } from './html.service';

@Injectable()
export class TextService extends HtmlService {

    visible = false;

    onInput(content: ContentModel<HtmlText>, contentHtml: ElementRef) {
        super.onInput(content, contentHtml);
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

    enter(e: any) {
        throw new Error('Method not implemented.');
    }

    backDown(e: any) {
        throw new Error('Method not implemented.');
    }

    backUp(e: any) {
        throw new Error('Method not implemented.');
    }

    getTextChild(contentHtml: ElementRef) {
        return contentHtml.nativeElement;
    }

    mouseEnter($event, contentHtml: ElementRef) {
        this.visible = true && this.isContentEmpty(contentHtml) && !this.selectionService.ismousedown;
    }

    mouseOut($event, contentHtml: ElementRef) {
        this.visible = (document.activeElement === this.getTextChild(contentHtml)) && this.isContentEmpty(contentHtml);
    }

    setFocus($event, contentHtml: ElementRef) {
        this.getTextChild(contentHtml).focus();
        this.visible = true && this.isContentEmpty(contentHtml);
    }

    setFocusToEnd(contentHtml: ElementRef) {
        this.contEditService.setCursor(this.getTextChild(contentHtml), false);
        this.visible = true && this.isContentEmpty(contentHtml);
    }

    focusOut()
    {
        this.visible = false;
        this.menuSelectionService.menuActive = false;
    }
}
