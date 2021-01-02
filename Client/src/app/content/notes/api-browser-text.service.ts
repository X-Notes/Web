import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiBrowserTextService {

  constructor() { }

  pasteCommandHandler(e) {
    e.preventDefault();
    let text = (e.originalEvent || e).clipboardData.getData('text/plain');
    text = text.replace(/&nbsp;/g, '');
    document.execCommand('insertHTML', false, text);
  }

  copyInputLink(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    input.setSelectionRange(0, 0);
  }
}
