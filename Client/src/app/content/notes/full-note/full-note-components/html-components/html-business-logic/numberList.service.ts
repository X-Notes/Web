import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from 'src/app/content/notes/models/editor-models/base-text';
import { EnterEvent } from '../../../models/enter-event.model';
import { TransformContent } from '../../../models/transform-content.model';
import { HtmlTextElementsService } from './html.text.elements.service';

@Injectable()
export class NumberListService extends HtmlTextElementsService {
  transformTo = new EventEmitter<TransformContent>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlur = (e: any) => {
    // BLUR HANDLER
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pasteCommandHandler = (e: any) => {
    throw new Error('Method not implemented.');
  };

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
    if (this.isContentEmpty(contentHtml)) {
      this.transformTo.emit({
        id: content.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      const breakModel = this.apiBrowserService.pressEnterHandler(
        this.getNativeElement(contentHtml),
      );
      const event = super.eventEventFactory(breakModel, NoteTextTypeENUM.Numberlist, content.id);
      enterEvent.emit(event);
    }
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
