import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiBrowserTextService {
  pasteCommandHandler = (e) => {
    e.preventDefault();
    let text = (e.originalEvent || e).clipboardData.getData('text/plain');
    text = text.replace(/&nbsp;/g, '');

    const range = this.getSelection().getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.selectNodeContents(textNode);
    range.collapse(false);
    const selection = this.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  copyInputLink(input: HTMLInputElement) {
    const text = input.value;
    this.copyTest(text);
  }

  copyTest = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      },
    );
  };

  getSelection = () => {
    return window.getSelection();
  };

  getSelectionCharacterOffsetsWithin = (element) => {
    if (!element) return null;

    let startOffset = 0;
    let endOffset = 0;
    const range = this.getSelection().getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    startOffset = preCaretRange.toString().length;
    endOffset = startOffset + range.toString().length;
    return { start: startOffset, end: endOffset };
  };
}
