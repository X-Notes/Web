import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../models/content-model.model';
import { EnterEvent } from '../../models/enter-event.model';
import { HtmlService } from './html.service';

@Injectable()
export class TextService extends HtmlService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlur = (e: any) => {
    // BLUR HANDLER
  };

  pasteCommandHandler(e: any) {
    super.pasteCommandHandler(e);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectStart = (e: any) => {
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
    const event = super.eventEventFactory(
      content.id,
      breakModel,
      NoteTextTypeENUM.Default,
      content.id,
    );
    enterEvent.emit(event);
    console.log(event);
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
