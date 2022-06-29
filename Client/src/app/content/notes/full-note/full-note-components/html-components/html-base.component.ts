import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiBrowserTextService } from '../../../api-browser-text.service';
import { BaseText, NoteTextTypeENUM, TextBlock } from '../../../models/editor-models/base-text';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { BreakEnterModel } from '../../content-editor-services/models/break-enter.model';
import { ClickableSelectableEntities } from '../../content-editor-services/models/clickable-selectable-entities.enum';
import { SelectionService } from '../../content-editor-services/selection.service';
import { DeltaConverter } from '../../content-editor/converter/delta-converter';
import { EnterEvent } from '../../models/enter-event.model';
import { BaseEditorElementComponent } from '../base-html-components';
import { InputHtmlEvent } from './models/input-html-event';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseTextElementComponent extends BaseEditorElementComponent {
  @Input()
  content: BaseText;

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  concatThisWithPrev = new EventEmitter<string>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<BaseTextElementComponent>();

  @Output()
  inputHtmlEvent = new EventEmitter<InputHtmlEvent>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  preFocus = false;

  textChanged: Subject<string> = new Subject();

  destroy = new Subject<void>();

  viewHtml: string;

  listeners = [];

  constructor(
    cdr: ChangeDetectorRef,
    protected apiBrowserTextService: ApiBrowserTextService,
    public selectionService: SelectionService,
    protected clickableService: ClickableContentService,
    private renderer: Renderer2,
  ) {
    super(cdr);

    this.textChanged.pipe(takeUntil(this.destroy)).subscribe(() => {
      if (!this.contentHtml) return;
      this.inputHtmlEvent.emit({
        content: this.content,
        html: this.contentHtml.nativeElement.innerHTML,
      });
    });
  }

  get isActiveState() {
    return this.getIsActive();
  }

  onInput() {
    this.syncHtmlWithLayout();
  }

  syncHtmlWithLayout() {
    this.textChanged.next();
  }

  initBaseHTML(): void {
    const delta = DeltaConverter.convertToDelta(this.content.contents);
    this.viewHtml = DeltaConverter.convertDeltaToHtml(delta);
    this.syncHtmlWithLayout();
  }

  updateHTML(contents: TextBlock[]) {
    const delta = DeltaConverter.convertToDelta(contents);
    const html = DeltaConverter.convertDeltaToHtml(delta);
    this.updateNativeHTML(html);
    this.syncHtmlWithLayout();
  }

  syncContentWithLayout() {
    const el = this.contentHtml.nativeElement;
    const savedSel = this.apiBrowserTextService.saveSelection(el);
    this.updateHTML(this.content.contents);
    this.apiBrowserTextService.restoreSelection(el, savedSel);
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

  getTextBlocks(): TextBlock[] {
    const html = this.getEditableNative<HTMLElement>().innerHTML;
    const delta = DeltaConverter.convertHTMLToDelta(html);
    return DeltaConverter.convertToTextBlocks(delta);
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
    this.apiBrowserTextService.setCursor(this.contentHtml.nativeElement, false);
    this.setFocusedElement();
    this.onFocus.emit(this);
  }

  setFocusedElement() {
    this.clickableService.setSontent(this.content.id, null, ClickableSelectableEntities.Text, this);
  }

  // LISTENERS

  pasteCommandHandler(e) {
    this.apiBrowserTextService.pasteCommandHandler(e);
    this.textChanged.next();
  }

  checkForDeleteOrConcatWithPrev($event) {
    if (this.selectionService.isAnySelect()) {
      return;
    }

    const selection = this.apiBrowserTextService.getSelection().toString();
    if (
      this.apiBrowserTextService.isStart(this.getEditableNative()) &&
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
    const blur = this.renderer.listen(el, 'blur', (e) => {
      this.onBlur(e);
    });
    const paste = this.renderer.listen(el, 'paste', (e) => {
      this.pasteCommandHandler(e);
    });
    const selectStart = this.renderer.listen(el, 'selectstart', (e) => {
      this.onSelectStart(e);
    });
    const keydownEnter = this.renderer.listen(el, 'keydown.enter', (e) => {
      this.enter(e);
    });
    const keydownBackspace = this.renderer.listen(el, 'keydown.backspace', (e) => {
      this.checkForDeleteOrConcatWithPrev(e);
    });
    const keyupBackspace = this.renderer.listen(el, 'keyup.backspace', (e) => {
      this.backUp(e);
    });
    const keydownDelete = this.renderer.listen(el, 'keydown.delete', (e) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSelectStart(e) {}

  syncContentItems() {}

  private updateNativeHTML(html: string): void {
    this.contentHtml.nativeElement.innerHTML = html;
  }

  abstract enter(e);
}
