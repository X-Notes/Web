import { ElementRef, EventEmitter, Injectable, Renderer2 } from '@angular/core';
import { ApiBrowserTextService } from '../../../api-browser-text.service';
import {
  BreakEnterModel,
  ContentEditableService,
} from '../../content-editor-services/content-editable.service';
import { MenuSelectionService } from '../../content-editor-services/menu-selection.service';
import { BaseText, ContentModel, NoteTextTypeENUM } from '../../../models/content-model.model';
import { EnterEvent } from '../../models/enter-event.model';
import { SelectionService } from '../../content-editor-services/selection.service';
import { NavigationKeysService } from '../../content-editor-services/navigation-keys.service';

@Injectable()
export abstract class HtmlService {
  preFocus = false;

  listeners = [];

  constructor(
    public apiBrowserService: ApiBrowserTextService,
    public selectionService: SelectionService,
    public menuSelectionService: MenuSelectionService,
    private renderer: Renderer2,
    public contEditService: ContentEditableService,
    private navigationKeysService: NavigationKeysService,
  ) {}

  pasteCommandHandler(e) {
    this.apiBrowserService.pasteCommandHandler(e);
  }

  checkForDelete(
    $event,
    content: BaseText,
    contentHtml: ElementRef,
    concatThisWithPrev: EventEmitter<string>,
    deleteThis: EventEmitter<string>,
  ) {

    if(this.selectionService.isAnySelect()){
      return;
    }

    const selection = this.apiBrowserService.getSelection().toString();
    if (
      this.contEditService.isStart(this.getNativeElement(contentHtml)) &&
      !this.isContentEmpty(contentHtml) &&
      selection === ''
    ) {
      $event.preventDefault();
      concatThisWithPrev.emit(content.id);
    }

    if (this.isContentEmpty(contentHtml)) {
      $event.preventDefault();
      deleteThis.emit(content.id);
    }
  }

  isContentEmpty(contentHtml: ElementRef) {
    return this.getNativeElement(contentHtml)?.textContent.length === 0;
  }

  // eslint-disable-next-line class-methods-use-this
  getNativeElement(contentHtml: ElementRef) {
    return contentHtml?.nativeElement;
  }
  
  setHandlers(
    content: BaseText,
    contentHtml: ElementRef,
    enterEvent: EventEmitter<EnterEvent>,
    concatThisWithPrev: EventEmitter<string>,
    deleteThis: EventEmitter<string>,
  ) {
    const blur = this.renderer.listen(contentHtml.nativeElement, 'blur', (e) => {
      this.onBlur(e);
    });
    const paste = this.renderer.listen(contentHtml.nativeElement, 'paste', (e) => {
      this.pasteCommandHandler(e);
    });
    const selectStart = this.renderer.listen(contentHtml.nativeElement, 'selectstart', (e) => {
      this.onSelectStart(e);
    });
    const keydownEnter = this.renderer.listen(contentHtml.nativeElement, 'keydown.enter', (e) => {
      this.enter(e, content, contentHtml, enterEvent);
    });
    const keydownBackspace = this.renderer.listen(
      contentHtml.nativeElement,
      'keydown.backspace',
      (e) => {
        this.checkForDelete(e, content, contentHtml, concatThisWithPrev, deleteThis);
      },
    );
    const keyupBackspace = this.renderer.listen(
      contentHtml.nativeElement,
      'keyup.backspace',
      (e) => {
        this.backUp(e);
      },
    );
    const keydownDelete = this.renderer.listen(
      contentHtml.nativeElement,
      'keydown.delete',
      (e) => {
        this.checkForDelete(e, content, contentHtml, concatThisWithPrev, deleteThis);
      },
    );
    this.listeners.push(blur, paste, selectStart, keydownBackspace, keydownEnter, keyupBackspace, keydownDelete);
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  isActive(contentHtml: ElementRef) {
    return (
      (this.isContentEmpty(contentHtml) &&
        document.activeElement === this.getNativeElement(contentHtml)) ||
      (this.preFocus && this.isContentEmpty(contentHtml))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter($event, contentHtml: ElementRef) {
    this.preFocus = !this.selectionService.ismousedown;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseOut($event, contentHtml: ElementRef) {
    this.preFocus = false;
  }
  

  // eslint-disable-next-line class-methods-use-this
  eventEventFactory(
    id: string,
    breakModel: BreakEnterModel,
    nextItemType: NoteTextTypeENUM,
    contentId: string,
  ): EnterEvent {
    const eventModel: EnterEvent = {
      id,
      breakModel,
      nextItemType,
      contentId,
    };
    return eventModel;
  }
  
  setFocus($event: any, contentHtml: ElementRef<any>, contentModel: ContentModel) {
    this.getNativeElement(contentHtml).focus();
    this.setFocusedElement(contentModel);
  }
  
  setFocusToEnd(contentHtml: ElementRef<any>, contentModel: ContentModel) {
    this.contEditService.setCursor(this.getNativeElement(contentHtml), false);
    this.setFocusedElement(contentModel);
  }

  setFocusedElement(contentModel: ContentModel) {
    this.navigationKeysService.setSontent = contentModel;
  }

  abstract onBlur(e);

  abstract onSelectStart(e);

  abstract enter(
    e,
    content: BaseText,
    contentHtml: ElementRef,
    enterEvent: EventEmitter<EnterEvent>,
  );

  abstract backUp(e);

}
