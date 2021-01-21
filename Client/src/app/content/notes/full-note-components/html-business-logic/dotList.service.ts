import { ElementRef, Injectable } from '@angular/core';
import { ContentModel, HtmlText } from '../../models/ContentMode';
import { HtmlService } from './html.service';

@Injectable()
export class DotListService extends HtmlService {

    onInput(content: ContentModel<HtmlText>, contentHtml: ElementRef) {
        super.onInput(content, contentHtml);
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
      return contentHtml.nativeElement.children[0].children[1];
    }

}
