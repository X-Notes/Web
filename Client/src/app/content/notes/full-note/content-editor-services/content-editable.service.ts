import { Injectable } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';

export interface BreakEnterModel {
  isFocusToNext: boolean;
  nextContent?: DocumentFragment;
  nextHtml?: string;
}

@Injectable()
export class ContentEditableService {
  constructor(private apiBrowserService: ApiBrowserTextService) {}

  pressEnterHandler(e): BreakEnterModel {
    let isFocusToNext = false;
    let nextContent: DocumentFragment;
    let nextHtml: string;
    const el = e as Node;
    const sel = this.apiBrowserService.getSelection();
    if (sel.rangeCount) {
      const selRange = sel.getRangeAt(0);
      const range = selRange.cloneRange();

      range.selectNodeContents(el);
      range.setEnd(selRange.startContainer, selRange.startOffset);
      const atStart = range.toString().replace(/^\s+|\s+$/g, '') === '';
      // eslint-disable-next-line no-empty
      if (atStart) {
      }

      range.selectNodeContents(el);
      range.setStart(selRange.endContainer, selRange.endOffset);
      const atEnd = range.toString().replace(/^\s+|\s+$/g, '') === '';
      if (atEnd) {
        isFocusToNext = true;
      }

      if (!atStart && !atEnd) {
        isFocusToNext = true;
        range.selectNodeContents(el);
        range.setStart(selRange.endContainer, selRange.startOffset);
        nextContent = range.extractContents();
        nextHtml = (nextContent.firstChild as HTMLElement).innerHTML;
      }
    }
    return { isFocusToNext, nextHtml, nextContent };
  }

  // eslint-disable-next-line consistent-return
  isStart(element) {
    const sel = this.apiBrowserService.getSelection();
    if (sel.rangeCount) {
      const selRange = sel.getRangeAt(0);
      const range = selRange.cloneRange();
      range.selectNodeContents(element);
      range.setEnd(selRange.startContainer, selRange.startOffset);
      const atStart = range.toString().replace(/^\s+|\s+$/g, '') === '';
      if (atStart) {
        return true;
      }
      return false;
    }
  }

  setCursor(e: HTMLElement, isStart: boolean) {
    const range = document.createRange(); // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(e); // Select the entire contents of the element with the range
    range.collapse(isStart); // collapse the range to the end point. false means collapse to end rather than the start
    const selection = this.apiBrowserService.getSelection(); // get the selection object (allows you to change selection)
    selection.removeAllRanges(); // remove any selections already made
    selection.addRange(range); // make the range you have just created the visible selection
  }
}
