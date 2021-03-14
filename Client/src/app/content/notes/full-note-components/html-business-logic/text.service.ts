import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, ContentType } from '../../models/ContentMode';
import { EnterEvent } from '../../models/enterEvent';
import { HtmlService } from './html.service';

@Injectable()
export class TextService extends HtmlService {
  onBlur = (e: any) => {
    console.log(e);
    // BLUR HANDLER
  };

  pasteCommandHandler(e: any) {
    super.pasteCommandHandler(e);
  }

  onSelectStart = (e: any) => {
    console.log(e);
    // SELECTIION
  };

  enter(
    $event: any,
    base: BaseText,
    contentHtml: ElementRef,
    enterEvent: EventEmitter<EnterEvent>,
  ) {
    const content = base;
    $event.preventDefault();
    const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
    content.content = this.getNativeElement(contentHtml).innerText;
    const event = super.eventEventFactory(content.id, breakModel, ContentType.DEFAULT, content.id);
    enterEvent.emit(event);
  }

  backDown(
    $event,
    content: BaseText,
    contentHtml: ElementRef,
    concatThisWithPrev: EventEmitter<string>,
    deleteThis: EventEmitter<string>,
  ) {
    super.backDown($event, content, contentHtml, concatThisWithPrev, deleteThis);
  }

  backUp = (e: any) => {
    console.log(e);
  };

  setFocus($event, contentHtml: ElementRef) {
    this.getNativeElement(contentHtml).focus();
  }

  setFocusToEnd(contentHtml: ElementRef) {
    this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
  }
}
