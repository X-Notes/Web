import { ElementRef, Injectable } from '@angular/core';
import { LineBreakType } from './html-models';

@Injectable()
export class ContentEditableService {

  constructor() { }

  enterService(e: ElementRef) {
    let typeBreakLine: LineBreakType;
    let nextContent: DocumentFragment;
    const el = e.nativeElement as Node;
    const sel = window.getSelection();
    if (sel.rangeCount) {

      const selRange = sel.getRangeAt(0);
      const range = selRange.cloneRange();

      range.selectNodeContents(el);
      range.setEnd(selRange.startContainer, selRange.startOffset);
      const atStart = (range.toString().replace(/^\s+|\s+$/g, '') === '');
      if (atStart)
      {
        typeBreakLine = LineBreakType.PREV_NO_CONTENT;
      }

      range.selectNodeContents(el);
      range.setStart(selRange.endContainer, selRange.endOffset);
      const atEnd = (range.toString().replace(/^\s+|\s+$/g, '') === '');
      if (atEnd)
      {
        typeBreakLine = LineBreakType.NEXT_NO_CONTENT;
      }

      if (!atStart && !atEnd)
      {
        typeBreakLine = LineBreakType.NEXT_WITH_CONTENT;
        range.selectNodeContents(el);
        range.setStart(selRange.endContainer, selRange.startOffset);
        nextContent = range.extractContents();
      }
    }
    return {typeBreakLine, nextContent};
  }

  setCursor(e: ElementRef, isStart: boolean)
  {
    const range = document.createRange(); // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(e.nativeElement); // Select the entire contents of the element with the range
    range.collapse(isStart); // collapse the range to the end point. false means collapse to end rather than the start
    const selection = window.getSelection(); // get the selection object (allows you to change selection)
    selection.removeAllRanges(); // remove any selections already made
    selection.addRange(range); // make the range you have just created the visible selection
    console.log(range);
    console.log(selection);
  }

}