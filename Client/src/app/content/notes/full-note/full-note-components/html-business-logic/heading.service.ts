import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../../models/content-model.model';
import { EnterEvent } from '../../models/enter-event.model';
import { HtmlService } from './html.service';

@Injectable()
export class HeadingService extends HtmlService {

  onBlur = (e: any) => {
    // BLUR HANDLER
  };

  pasteCommandHandler = (e: any) => {
    throw new Error('Method not implemented.');
  };

  onSelectStart = (e: any) => {
    // SELECTIION
  };

  enter(
    $event: any,
    base: BaseText,
    contentHtml: ElementRef,
    enterEvent: EventEmitter<EnterEvent>,
  ) {
    $event.preventDefault();
    const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
    const event = super.eventEventFactory(base.id, breakModel, NoteTextTypeENUM.Default, base.id);
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
  };
}
