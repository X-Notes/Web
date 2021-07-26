import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../../models/content-model.model';
import { EnterEvent } from '../../models/enter-event.model';
import { HtmlService } from './html.service';

@Injectable()
export class HeadingService extends HtmlService {
  setFocus($event: any, contentHtml: ElementRef<any>) {
    this.getNativeElement(contentHtml).focus();
  }

  setFocusToEnd(contentHtml: ElementRef<any>) {
    this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
  }

  onInput(base: BaseText, contentHtml: ElementRef) {
    const content = { ...base };
    content.content = this.getNativeElement(contentHtml).innerText;
  }

  onBlur = (e: any) => {
    console.log(e);
    // BLUR HANDLER
  };

  pasteCommandHandler = (e: any) => {
    console.log(e);
    throw new Error('Method not implemented.');
  };

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
    const event = super.eventEventFactory(
      content.id,
      breakModel,
      NoteTextTypeENUM.Default,
      content.id,
    );
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
}
