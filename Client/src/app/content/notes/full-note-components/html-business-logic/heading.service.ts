import { ElementRef, } from '@angular/core';
import { HtmlService } from './html.service';

export class HeadingService extends HtmlService {

    onInput(e: any) {
        throw new Error('Method not implemented.');
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
