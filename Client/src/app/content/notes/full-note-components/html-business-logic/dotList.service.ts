import { ElementRef } from '@angular/core';
import { HtmlCommandsAbstract } from './command-interface';

export class DotListService extends HtmlCommandsAbstract {

    defaultEmptyString = 'List';

    abstractonBlur(e: any) {
        throw new Error('Method not implemented.');
    }

    getContentChild(contentHtml: ElementRef): any {
        return contentHtml.nativeElement.children[0].children[1];
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
