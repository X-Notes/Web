import { ElementRef } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { MenuSelectionService } from '../../menu-selection.service';
import { SelectionService } from '../../selection.service';

export abstract class HtmlCommandsAbstract {

    abstract defaultEmptyString: string;

    constructor(
        private apiBrowserService: ApiBrowserTextService,
        private selectionService: SelectionService,
        public menuSelectionService: MenuSelectionService, ) {
    }

    abstract abstractonBlur(e);

    abstract getContentChild(contentHtml: ElementRef);

    pasteCommandHandler(e) {
        this.apiBrowserService.pasteCommandHandler(e);
    }

    mouseUp($event: MouseEvent) {
        const selection = this.apiBrowserService.getSelection();
        if (selection.toString() !== '') {
            const coords = selection.getRangeAt(0).getBoundingClientRect();
            this.menuSelectionService.menuActive = true;
            this.menuSelectionService.left = ((coords.left + coords.right) / 2) - this.selectionService.sidebarWidth;
            this.menuSelectionService.top = coords.top - this.selectionService.menuHeight - 45;
        } else {
            this.menuSelectionService.menuActive = false;
        }
    }

    abstract enter(e);
    abstract backDown(e);
    abstract backUp(e);

    isContentEmpty(contentHtml: ElementRef) {
        return this.getContentChild(contentHtml).textContent.length === 0;
    }
}
