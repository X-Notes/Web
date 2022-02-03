import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/base-text';
import { EnterEvent } from '../../../models/enter-event.model';
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
    content: BaseText,
    contentHtml: ElementRef,
    enterEvent: EventEmitter<EnterEvent>,
  ) {
    $event.preventDefault();
    const breakModel = this.contEditService.pressEnterHandler(this.getNativeElement(contentHtml));
    const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.Default, content.id);
    enterEvent.emit(event);
  }

  checkForDeleteOrConcatWithPrev(
    $event,
    content: BaseText,
    contentHtml: ElementRef,
    concatThisWithPrev: EventEmitter<string>,
    deleteThis: EventEmitter<string>,
  ) {
    super.checkForDeleteOrConcatWithPrev(
      $event,
      content,
      contentHtml,
      concatThisWithPrev,
      deleteThis,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backUp = (e: any) => {};
}
