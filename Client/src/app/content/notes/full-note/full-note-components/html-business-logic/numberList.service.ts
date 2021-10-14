import { ElementRef, EventEmitter, Injectable } from '@angular/core';
import { BaseText, NoteTextTypeENUM } from '../../../models/content-model.model';
import { EnterEvent } from '../../models/enter-event.model';
import { TransformContent } from '../../models/transform-content.model';
import { HtmlService } from './html.service';

@Injectable()
export class NumberListService extends HtmlService {
  
  transformTo = new EventEmitter<TransformContent>();

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
    if (this.isContentEmpty(contentHtml)) {
      this.transformTo.emit({
        id: base.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      const breakModel = this.contEditService.enterService(this.getNativeElement(contentHtml));
      const event = super.eventEventFactory(
        base.id,
        breakModel,
        NoteTextTypeENUM.Numberlist,
        base.id,
      );
      enterEvent.emit(event);
    }
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
