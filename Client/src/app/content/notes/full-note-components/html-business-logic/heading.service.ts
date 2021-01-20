import { ElementRef, EventEmitter } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { MenuSelectionService } from '../../menu-selection.service';
import { ContentModel, Html, HtmlType } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { SelectionService } from '../../selection.service';
import { HtmlCommandsAbstract } from './command-interface';

export class HeadingService extends HtmlCommandsAbstract {

    defaultEmptyString = 'Heading';

    constructor(
        apiBrowserService: ApiBrowserTextService,
        selectionService: SelectionService,
        menuSelectionService: MenuSelectionService,
        contentHtml: ElementRef,
        content: ContentModel<Html>
    ) {
        super(apiBrowserService, selectionService, menuSelectionService, contentHtml, content);
    }

    abstractonBlur(e: any) {
        throw new Error('Method not implemented.');
    }

    getContentChild(contentHtml: ElementRef): any {
        return contentHtml.nativeElement.children[0];
    }

    enter(emitter: EventEmitter<EnterEvent>, eventModel: EnterEvent) {
        eventModel.itemType = HtmlType.Text;
        emitter.emit(eventModel);
    }

    backDown(e: any) {
        throw new Error('Method not implemented.');
    }

    backUp(e: any) {
        throw new Error('Method not implemented.');
    }

}
