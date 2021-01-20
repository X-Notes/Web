import { ElementRef, EventEmitter } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { MenuSelectionService } from '../../menu-selection.service';
import { ContentModel, Html, HtmlType } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { SelectionService } from '../../selection.service';

export abstract class HtmlCommandsAbstract {

    abstract defaultEmptyString: string;

    constructor(
        public apiBrowserService: ApiBrowserTextService,
        public selectionService: SelectionService,
        public menuSelectionService: MenuSelectionService,
        public contentHtml: ElementRef,
        public content: ContentModel<Html>) {
    }

    abstract abstractonBlur(e);

    abstract getContentChild(contentHtml: ElementRef);

    pasteCommandHandler(e) {
        this.apiBrowserService.pasteCommandHandler(e);
    }

    mouseUp($event: MouseEvent) {
    }

    abstract enter(emitter: EventEmitter<EnterEvent>, eventModel: EnterEvent);
    abstract backDown(e);
    abstract backUp(e);

    isContentEmpty() {
        return this.getContentChild(this.contentHtml).textContent.length === 0;
    }
}
