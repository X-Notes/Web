import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseText } from '../../../models/editor-models/base-text';
import { BreakEnterModel } from '../../content-editor-services/models/break-enter.model';
import { DeltaConverter } from '../../content-editor/converter/delta-converter';
import { ProjectBlock } from '../../content-editor/text/entities/blocks/projection-block';
import { HeadingTypeENUM } from '../../content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../../content-editor/text/note-text-type.enum';
import { EnterEvent } from '../../models/enter-event.model';
import { TransformContent } from '../../models/transform-content.model';
import { BaseEditorElementComponent } from '../base-html-components';

export interface PasteEvent {
  element: BaseTextElementComponent;
  htmlElementsToInsert: HTMLElement[];
}
@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseTextElementComponent extends BaseEditorElementComponent {
  @ViewChild('contentHtml') contentHtml: ElementRef;

  @Input()
  content: BaseText;

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Output()
  pasteEvent = new EventEmitter<PasteEvent>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<BaseTextElementComponent>();

  preFocus = false;

  destroy = new Subject<void>();

  listeners = [];

  get isActiveState(): boolean {
    return this.getIsActive() && !this.isReadOnlyMode;
  }

  transformContent($event, contentType: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    $event?.preventDefault();
    this.transformTo.emit({
      textType: contentType,
      headingType: heading,
      id: this.content.id,
      setFocusToEnd: true,
    });
  }

  getHeadingNumber(heading: number): HeadingTypeENUM {
    if (heading >= 3 && heading <= 4) {
      return HeadingTypeENUM.H2;
    }
    if (heading >= 5 && heading <= 6) {
      return HeadingTypeENUM.H3;
    }
    return HeadingTypeENUM.H1;
  }

  saveAndRestoreCursorWrapper(func: () => void): void {
    const el = this.contentHtml.nativeElement;
    const savedSel = this.facade.apiBrowserTextService.saveSelection(el);
    func();
    this.facade.apiBrowserTextService.restoreSelection(el, savedSel);
  }

  getContent(): BaseText {
    return this.content;
  }

  getContentId(): string {
    return this.content.id;
  }

  getEditableNative<T>() {
    return this.contentHtml?.nativeElement as T;
  }

  getTextBlocks(): ProjectBlock[] {
    const html = this.getEditableNative<HTMLElement>().innerHTML;
    return DeltaConverter.convertHTMLToTextBlocks(html);
  }

  getText(): string {
    return this.getEditableNative<HTMLElement>().textContent;
  }

  isContentEmpty() {
    return this.contentHtml?.nativeElement?.textContent.length === 0;
  }

  getIsActive() {
    return (
      (this.isContentEmpty() && document.activeElement === this.contentHtml.nativeElement) ||
      (this.preFocus && this.isContentEmpty())
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter($event) {
    $event.preventDefault();
    this.preFocus = !this.isSelectModeActive;
    this.isMouseOver = true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseLeave($event) {
    this.preFocus = false;
    this.isMouseOver = false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus($event) {
    this.contentHtml.nativeElement.focus();
    this.setFocusedElement();
    this.onFocus.emit(this);
  }

  setFocusToEnd() {
    this.facade.apiBrowserTextService.setCursor(this.contentHtml.nativeElement, false);
    this.setFocusedElement();
    this.onFocus.emit(this);
  }

  // LISTENERS
  isPasteLink(data: DataTransferItemList): boolean {
    for (const item of data as any) {
      if ((item as DataTransferItem).type === 'text/link-preview') {
        return true;
      }
    }
    return false;
  }

  checkForDeleteOrConcatWithPrev($event) {
    if (this.facade.selectionService.isAnySelect()) {
      return;
    }

    const selection = this.facade.apiBrowserTextService.getSelection().toString();
    if (
      this.facade.apiBrowserTextService.isStart(this.getEditableNative()) &&
      !this.isContentEmpty() &&
      selection === ''
    ) {
      $event.preventDefault();
      this.concatThisWithPrev.emit(this.content.id);
    }

    if (this.isContentEmpty()) {
      $event.preventDefault();
      this.deleteThis.emit(this.content.id);
    }
  }

  setHandlers() {
    const el = this.getEditableNative();
    const blur = this.facade.renderer.listen(el, 'blur', (e) => {
      this.onBlur(e);
    });
    const paste = this.facade.renderer.listen(el, 'paste', (e) => {
      this.pasteCommandHandler(e);
    });
    const selectStart = this.facade.renderer.listen(el, 'selectstart', (e) => {
      this.onSelectStart(e);
    });
    const keydownEnter = this.facade.renderer.listen(el, 'keydown.enter', (e) => {
      this.enter(e);
    });
    const keydownBackspace = this.facade.renderer.listen(el, 'keydown.backspace', (e) => {
      this.checkForDeleteOrConcatWithPrev(e);
    });
    const keyupBackspace = this.facade.renderer.listen(el, 'keyup.backspace', (e) => {
      this.backUp(e);
    });
    const keydownDelete = this.facade.renderer.listen(el, 'keydown.delete', (e) => {
      this.checkForDeleteOrConcatWithPrev(e);
    });
    this.listeners.push(
      blur,
      paste,
      selectStart,
      keydownBackspace,
      keydownEnter,
      keyupBackspace,
      keydownDelete,
    );
  }

  destroysListeners() {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }

  eventEventFactory(
    breakModel: BreakEnterModel,
    nextItemType: NoteTextTypeENUM,
    contentId: string,
  ): EnterEvent {
    const eventModel: EnterEvent = {
      breakModel,
      nextItemType,
      contentId,
    };
    return eventModel;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backUp(e) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlur(e) {}

  textClick(e: PointerEvent): void {
    const target = e.target as HTMLAnchorElement;
    if (target.localName === 'a' && target.href) {
      e.preventDefault();
      window.open(target.href, '_blank');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectStart(e) {}

  syncContentItems() {}

  abstract enter(e);

  abstract setFocusedElement(): void;

  abstract pasteCommandHandler(e): void;
}
