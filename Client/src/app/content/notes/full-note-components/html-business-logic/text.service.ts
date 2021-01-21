import { ElementRef, Injectable } from '@angular/core';
import { ContentModel, Html } from '../../models/ContentMode';
import { HtmlService } from './html.service';

@Injectable()
export class TextService extends HtmlService {

    onInput(content: ContentModel<Html>, contentHtml: ElementRef) {
        super.onInput(content, contentHtml);
    }

    onBlur(e: any) {
        throw new Error('Method not implemented.');
    }

    pasteCommandHandler(e: any) {
        throw new Error('Method not implemented.');
    }

    mouseUp(e: any) {
        throw new Error('Method not implemented.');
    }

    onSelectStart(e: any) {
        throw new Error('Method not implemented.');
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

    getTextChild(contentHtml: ElementRef)
    {
      return contentHtml.nativeElement.children[0];
    }
}
