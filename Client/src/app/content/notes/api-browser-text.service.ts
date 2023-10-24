import { Injectable } from '@angular/core';
import { BreakEnterModel } from 'src/app/editor/entities-ui/break-enter.model';
import { SaveSelection } from 'src/app/editor/entities-ui/save-selection';
@Injectable({
  providedIn: 'root',
})
export class ApiBrowserTextService {

  isCaretOnFirstLine(element, inaccuracy = 5) {
    const elRect = element.getBoundingClientRect();
    const sel = this.getSelection();
    if (!sel.rangeCount) return false;
    const selRect = sel.getRangeAt(0).getBoundingClientRect();
    const diff = Math.abs(selRect.top - elRect.top);
    return diff < inaccuracy;  // Use < 1 to account for potential float inaccuracies
  }

  isCaretOnLastLine(element, inaccuracy = 5) {
    const elRect = element.getBoundingClientRect();
    const sel = this.getSelection();
    if (!sel.rangeCount) return false;
    const selRect = sel.getRangeAt(0).getBoundingClientRect();
    const diff = Math.abs(selRect.bottom - elRect.bottom);
    return diff < inaccuracy;  // Use < 1 to account for potential float inaccuracies
  }

  pasteOnlyTextHandler = (e: ClipboardEvent) => {
    e.preventDefault();
    let text = e.clipboardData.getData('text/plain');
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

  pasteHTMLHandler = (node: Node) => {
    const range = this.getSelection().getRangeAt(0);
    range.deleteContents();
    range.insertNode(node);
    range.selectNodeContents(node);
    range.collapse(false);
    const selection = this.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  async copyInputLinkAsync(input: HTMLInputElement) {
    const text = input.value;
    await this.copyTextAsync(text);
  }

  async copyTextAsync(textToCopy) {
    // Navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
    } else {
      this.copyTextThroughTextArea(textToCopy);
    }
  }

  copyTextThroughTextArea(textToCopy: string, isText = true): void {
    // Use the 'out of viewport hidden text area' trick
    const textArea = document.createElement('textarea');

    if (isText) {
      textArea.value = textToCopy;
    } else {
      textArea.innerHTML = textToCopy;
    }

    // Move textarea out of the viewport so it's not visible
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';

    document.body.prepend(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (error) {
      console.error(error);
    } finally {
      textArea.remove();
    }
  }

  copyHTMLAsync = async (html) => {
    const blobHTML = new Blob([html], { type: 'text/html' });
    const richTextInput = new ClipboardItem({ 'text/html': blobHTML });
    await navigator.clipboard.write([richTextInput]);
  };

  copyTextV2Async = async (inputText) => {
    const blobTEXT = new Blob([inputText], { type: 'text/plain' });
    const text = new ClipboardItem({ 'text/plain': blobTEXT });
    await navigator.clipboard.write([text]);
  };

  fetchAndCopyImage = async (imageUrl: string): Promise<void> => {
    const resp = await fetch(imageUrl);
    const blob = await resp.blob();
    if (imageUrl.endsWith('.jpg') || imageUrl.endsWith('.jpeg')) {
      await this.copyJpg(blob);
      return;
    }
    await this.copyImage(blob);
  };

  async copyImage(blob: Blob): Promise<void> {
    const data = [new ClipboardItem({ [blob.type]: blob })];
    await navigator.clipboard.write(data);
  }

  copyJpg = (imgBlob: Blob) => {
    const imageUrl = window.URL.createObjectURL(imgBlob);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageEl = this.createImage({ src: imageUrl });
    imageEl.onload = (e: any) => {
      canvas.width = e.target.width;
      canvas.height = e.target.height;
      ctx.drawImage(e.target, 0, 0, e.target.width, e.target.height);
      canvas.toBlob(this.copyImage, 'image/png', 1);
    };
  };

  selectElement(element): void {
    this.getSelection().setBaseAndExtent(element, 0, element, 1);
  }

  createImage = (options): HTMLImageElement => {
    options = options || {};
    const img = Image ? new Image() : document.createElement('img');
    if (options.src) {
      img.src = options.src;
    }
    return img;
  };

  getSelection = () => {
    return window.getSelection();
  };

  isSelectionEmpty = () => {
    return this.getSelection().toString() === '';
  }

  getInputSelection(el: HTMLInputElement): number {
    return el.selectionStart;
  }

  getSelectionInfo = (element): SaveSelection => {
    if (!element) return null;

    let startOffset = 0;
    let endOffset = 0;
    const selection = this.getSelection();
    if (selection.type === 'None') {
      return null;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
    startOffset = preCaretRange.toString().length;
    endOffset = startOffset + range.toString().length;
    return { start: startOffset, end: endOffset, rect };
  };

  saveRangePositionTextOnly(bE: Node): number {
    const sel = this.getSelection();
    if (!bE || sel.type === 'None') return null;
    const range = sel.getRangeAt(0);
    return range.startOffset;
  }

  pressEnterHandler(e): BreakEnterModel {
    let isFocusToNext = false;
    let nextContent: DocumentFragment;
    let nextHtml: string;
    const el = e as Node;
    const sel = this.getSelection();
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
        const htmlEl = nextContent.firstChild as HTMLElement;
        nextHtml = htmlEl.nodeName === '#text' ? htmlEl.textContent : htmlEl.innerHTML;
      }
    }
    return { isFocusToNext, nextHtml, nextContent };
  }

  // eslint-disable-next-line consistent-return
  isStart(element): boolean {
    const sel = this.getSelection();
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

  setCursor(e: HTMLElement, isStart: boolean): void {
    if (!e) return;
    const range = document.createRange(); // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(e); // Select the entire contents of the element with the range
    range.collapse(isStart); // collapse the range to the end point. false means collapse to end rather than the start
    this.updateRange(range);
  }

  setCaretFirstChild(el: Node, pos: number): void {
    if (!el) return;
    const range = document.createRange();
    const containerStart = el.childNodes[0];
    if (!containerStart) return;
    pos = pos > el.textContent.length ? el.textContent.length : pos;
    range.setStart(containerStart, pos);
    range.collapse(true);
    this.updateRange(range);
  }

  setCaretInput(el: HTMLInputElement, startPos: number) {
    el.setSelectionRange(startPos, startPos);
  }

  restoreSelection(containerEl, savedSel: SaveSelection, restore = true): Range {
    if (!savedSel) return;
    let charIndex = 0;
    const range = document.createRange();
    range.setStart(containerEl, 0);
    range.collapse(true);
    const nodeStack = [containerEl];
    let node;
    let foundStart = false;
    let stop = false;

    while (!stop && (node = nodeStack.pop())) {
      if (node.nodeType === 3) {
        const nextCharIndex = charIndex + node.length;
        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
          range.setStart(node, savedSel.start - charIndex);
          foundStart = true;
        }
        if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
          range.setEnd(node, savedSel.end - charIndex);
          stop = true;
        }
        charIndex = nextCharIndex;
      } else {
        let i = node.childNodes.length;
        while (i--) {
          nodeStack.push(node.childNodes[i]);
        }
      }
    }

    if (restore) {
      const sel = this.getSelection();
      this.removeAllRanges(sel);
      sel.addRange(range);
    }
    return range;
  }

  removeAllRanges(sel: Selection = null): void {
    sel = sel ?? this.getSelection();
    sel.removeAllRanges();
  }

  private updateRange(range: Range): void {
    const selection = this.getSelection();
    selection.removeAllRanges(); // remove any selections already made
    selection.addRange(range); // make the range you have just created the visible selection
  }
}
