import { ElementRef } from '@angular/core';
import { HtmlCommandsAbstract } from './command-interface';

export class TextService extends HtmlCommandsAbstract {

    defaultEmptyString = 'Type / for browse options';

    abstractonBlur(e: any) {
        throw new Error('Method not implemented.');
    }

    getContentChild(contentHtml: ElementRef): any {
        return contentHtml.nativeElement.children[0];
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

}
