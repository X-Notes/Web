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
import { DomSanitizer } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiBrowserTextService } from '../../../api-browser-text.service';
import { BaseText } from '../../../models/editor-models/base-text';
import { HeadingTypeENUM } from '../../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../../models/editor-models/text-models/note-text-type.enum';
import { TextBlock } from '../../../models/editor-models/text-models/text-block';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { BreakEnterModel } from '../../content-editor-services/models/break-enter.model';
import { ClickableSelectableEntities } from '../../content-editor-services/models/clickable-selectable-entities.enum';
import { SelectionService } from '../../content-editor-services/selection.service';
import { DeltaConverter } from '../../content-editor/converter/delta-converter';
import { DeltaListEnum } from '../../content-editor/converter/entities/delta-list.enum';
import { EnterEvent } from '../../models/enter-event.model';
import { TransformContent } from '../../models/transform-content.model';
import { BaseEditorElementComponent } from '../base-html-components';
import { InputHtmlEvent } from './models/input-html-event';
import { isValidURL } from '../../../../../shared/utils/is-valid-url.util';

export interface PasteEvent {
  element: BaseTextElementComponent;
  htmlElementsToInsert: HTMLElement[];
}
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
    protected apiBrowser: ApiBrowserTextService,
    public selectionService: SelectionService,
    protected clickableService: ClickableContentService,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
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
    return this.getIsActive() && !this.isReadOnlyMode;
  }

  onInput() {
    this.syncHtmlWithLayout();
  }

  syncHtmlWithLayout() {
    this.textChanged.next();
  }

  initBaseHTML(): void {
    if (this.content.contents?.length > 0) {
      const html = DeltaConverter.convertTextBlocksToHTML(this.content.contents);
      this.sanitizer.bypassSecurityTrustHtml(html);
      const convertedHTML = this.sanitizer.bypassSecurityTrustHtml(html) ?? '';
      this.viewHtml = convertedHTML as string;
      this.syncHtmlWithLayout();
    }
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

  updateHTML(contents: TextBlock[]): void {
    const html = DeltaConverter.convertTextBlocksToHTML(contents);
    this.updateNativeHTML(html);
    this.syncHtmlWithLayout();
    // TODO TEST IT
    const listType = contents.find((x) => x.list !== null)?.list;
    if (listType) {
      if (listType === DeltaListEnum.bullet) {
        this.transformContent(null, NoteTextTypeENUM.Dotlist);
      }
      if (listType === DeltaListEnum.ordered) {
        this.transformContent(null, NoteTextTypeENUM.Numberlist);
      }
    }
  }

  syncContentWithLayout() {
    const el = this.contentHtml.nativeElement;
    const savedSel = this.apiBrowser.saveSelection(el);
    this.updateHTML(this.content.contents);
    this.apiBrowser.restoreSelection(el, savedSel);
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
    return DeltaConverter.convertHTMLToTextBlocks(html);
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
    this.apiBrowser.setCursor(this.contentHtml.nativeElement, false);
    this.setFocusedElement();
    this.onFocus.emit(this);
  }

  setFocusedElement() {
    this.clickableService.setSontent(this.content, null, ClickableSelectableEntities.Text, this);
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

  pasteCommandHandler(e: ClipboardEvent) {
    const isLink = this.isPasteLink(e.clipboardData.items);
    e.preventDefault();
    if (isLink) {
      const json = e.clipboardData.getData('text/link-preview') as any;
      const data = JSON.parse(json);
      const title = data.title;
      const url = data.url;
      const pos = this.apiBrowser.getSelectionCharacterOffsetsWithin(this.getEditableNative());
      const html = DeltaConverter.convertTextBlocksToHTML(this.content.contents);
      const resultDelta = DeltaConverter.insertLink(html, pos.start, title, url);
      const resTextBlocks = DeltaConverter.convertDeltaToTextBlocks(resultDelta);
      this.updateHTML(resTextBlocks);
    } else {
      const html = e.clipboardData.getData('text/html');
      const htmlElements = DeltaConverter.splitDeltaByDividers(html);
      if (htmlElements.length === 0) return;

      if (this.isContentEmpty()) {
        const htmlEl = htmlElements[0];
        const resTextBlocks = DeltaConverter.convertHTMLToTextBlocks(htmlEl.outerHTML);
        this.updateHTML(resTextBlocks);
        htmlElements.shift(); // remove first element
      }

      if (htmlElements.length > 0) {
        const pasteObject: PasteEvent = {
          element: this,
          htmlElementsToInsert: htmlElements,
        };
        this.pasteEvent.emit(pasteObject);
      }
    }
    this.textChanged.next();
  }

  checkForDeleteOrConcatWithPrev($event) {
    if (this.selectionService.isAnySelect()) {
      return;
    }

    const selection = this.apiBrowser.getSelection().toString();
    if (
      this.apiBrowser.isStart(this.getEditableNative()) &&
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

  private updateNativeHTML(html: string): void {
    this.contentHtml.nativeElement.innerHTML = html;
  }

  abstract enter(e);
}
