import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { UpdateCursorAction } from 'src/app/content/notes/state/editor-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { DeltaConverter } from '../../converter/delta-converter';
import { DeltaListEnum } from '../../converter/entities/delta-list.enum';
import { BreakEnterModel } from '../../entities-ui/break-enter.model';
import { TextCursor } from '../../entities-ui/cursors-ui/text-cursor';
import { TextCursorUI } from '../../entities-ui/cursors-ui/text-cursor-ui';
import { EnterEvent } from '../../entities-ui/enter-event.model';
import { InputHtmlEvent } from '../../entities-ui/input-html-event';
import { SaveSelection } from '../../entities-ui/save-selection';
import { SetFocus } from '../../entities-ui/set-focus';
import { TransformContent } from '../../entities-ui/transform-content.model';
import { MutateRowAction } from '../../entities-ui/undo/mutate-row-action';
import { BaseText } from '../../entities/contents/base-text';
import { HeadingTypeENUM } from '../../entities/contents/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../entities/contents/text-models/note-text-type.enum';
import { TextBlock } from '../../entities/contents/text-models/text-block';
import { UpdateCursor } from '../../entities/cursors/cursor';
import { CursorTypeENUM } from '../../entities/cursors/cursor-type.enum';
import { BaseEditorElementComponent } from '../base-html-components';
import { HtmlComponentsFacadeService } from '../html-components.facade.service';
import { ParentInteractionHTML, ComponentType } from '../parent-interaction.interface';
import { EditorSelectionModeEnum } from '../../entities-ui/editor-selection-mode.enum';

@Component({
  template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseTextElementComponent
  extends BaseEditorElementComponent
  implements ParentInteractionHTML {
  @Input()
  content: BaseText;

  @Input()
  forceFocus: boolean;

  @Input()
  editorSelectionMode: EditorSelectionModeEnum;

  @Output()
  enterEvent = new EventEmitter<EnterEvent>();

  @Output()
  mouseoverEvent = new EventEmitter<void>();

  @Output()
  mouseleaveEvent = new EventEmitter<void>();

  @Output()
  transformTo = new EventEmitter<TransformContent>();

  @Output()
  concatThisWithPrev = new EventEmitter<ParentInteractionHTML>();

  @Output()
  deleteThis = new EventEmitter<string>();

  @Output()
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  onFocus = new EventEmitter<BaseTextElementComponent>();

  @Output()
  inputHtmlEvent = new EventEmitter<InputHtmlEvent>();

  @ViewChild('contentHtml') contentHtml: ElementRef;

  type = ComponentType.HTML;

  preFocus = false;

  textChanged: Subject<string> = new Subject();

  destroy = new Subject<void>();

  viewHtml: string;

  listeners = [];

  constructor(cdr: ChangeDetectorRef, facade: HtmlComponentsFacadeService) {
    super(cdr, facade);

    this.textChanged.pipe(takeUntil(this.destroy)).subscribe(() => {
      if (!this.contentHtml) return;
      this.inputHtmlEvent.emit({
        content: this.content,
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  theme: ThemeENUM;

  get isActiveState(): boolean {
    return this.getIsActive() && !this.isReadOnlyMode;
  }

  get isActiveStateNoHover(): boolean {
    return this.isContentEmpty() && !this.isReadOnlyMode;
  }

  get uiCursors$(): Observable<TextCursorUI[]> {
    return this.getTextCursors()?.pipe(
      map((x) => {
        return x.map((q) => this.mapCursor(q)).filter((q) => q);
      }),
    );
  }

  getSelection(): SaveSelection {
    const el = this.contentHtml?.nativeElement;
    if (!el) return null;
    return this.facade.apiBrowser.getSelectionInfo(el);
  }

  restoreSelection(pos: SaveSelection): void {
    const el = this.contentHtml?.nativeElement as HTMLElement;
    if (!el) return;
    this.facade.apiBrowser.restoreSelection(el, pos);
    this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
  }

  onInput(): void {
    this.handleUndoTextAction(this.content);
    this.initContentFromHTML(this.contentHtml.nativeElement.innerHTML);
    this.textChanged.next();
    this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
  }

  initContentFromHTML(html: string): void {
    const contents = DeltaConverter.convertHTMLToTextBlocks(html);
    this.content.contents = contents;
  }

  syncHtmlWithLayout() {
    this.handleUndoTextAction(this.content);
    this.initContentFromHTML(this.contentHtml.nativeElement.innerHTML);
    this.textChanged.next();
  }

  getText(): string {
    return this.getEditableNative<HTMLElement>().textContent;
  }

  get hasText(): boolean {
    return this.getText()?.length > 0;
  }

  initBaseHTML(): void {
    if (this.content.contents?.length > 0) {
      const html = DeltaConverter.convertTextBlocksToHTML(this.content.contents);
      this.facade.sanitizer.bypassSecurityTrustHtml(html);
      const convertedHTML = this.facade.sanitizer.bypassSecurityTrustHtml(html) ?? '';
      this.viewHtml = convertedHTML as string;
      this.textChanged.next();
    }
  }

  transformContent($event, contentType: NoteTextTypeENUM, heading?: HeadingTypeENUM) {
    $event?.preventDefault();
    this.transformTo.emit({
      textType: contentType,
      headingType: heading,
      contentId: this.content.id,
      setFocusToEnd: true,
    });
  }

  updateContentsAndSync(contents: TextBlock[], ...actions: (() => void)[]): void {
    this.handleUndoTextAction(this.content);
    this.content.contents = contents;
    const html = DeltaConverter.convertTextBlocksToHTML(contents);
    this.updateNativeHTML(html);
    this.textChanged.next();

    if (actions.length > 0) {
      this.addActionsAfterViewInit(actions);
    }
  }

  updateHTML(contents: TextBlock[]): void {
    const html = DeltaConverter.convertTextBlocksToHTML(contents);
    this.updateNativeHTML(html);
  }

  syncLayoutWithContent() {
    const el = this.contentHtml.nativeElement;
    const savedSel = this.getSelection();
    this.updateHTML(this.content.contents);
    this.facade.apiBrowser.restoreSelection(el, savedSel);
  }

  updateWS(): void {
    const el = this.contentHtml.nativeElement;
    const savedSel = this.getSelection();
    const html = DeltaConverter.convertTextBlocksToHTML(this.content.contents);
    this.updateNativeHTML(html);
    if (this.isFocused) {
      this.facade.apiBrowser.restoreSelection(el, savedSel);
    }
    this.detectChanges();
  }

  getContent(): BaseText {
    return this.content;
  }

  getTextType(): NoteTextTypeENUM {
    return this.content.noteTextTypeId;
  }

  handleUndoTextAction(text: BaseText): void {
    const contents = text.contents?.map((x) => new TextBlock(x)) ?? [];
    const action = new MutateRowAction(contents, text.id);
    this.facade.momentoStateService.saveToStack(action);
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
      (this.isContentEmpty() && this.isFocused) ||
      (this.preFocus && this.isContentEmpty()) ||
      (this.forceFocus && this.isContentEmpty())
    );
  }

  get isFocused(): boolean {
    return document.activeElement === this.contentHtml.nativeElement;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter($event) {
    $event.preventDefault();
    this.isSelectModeActive$.pipe(take(1)).subscribe((x) => (this.preFocus = !x));
    this.isMouseOver = true;
    this.mouseoverEvent.emit();
  }

  mouseDown($event: MouseEvent): void { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseLeave($event) {
    this.preFocus = false;
    this.isMouseOver = false;
    this.mouseleaveEvent.emit();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocusText($event: MouseEvent): void {
    this.setFocus(null);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setFocus($event: SetFocus) {
    this.contentHtml.nativeElement.focus();
    this.setFocusedElement();
    this.onFocus.emit(this);
    this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
  }

  setFocusToEnd() {
    this.facade.apiBrowser.setCursor(this.contentHtml.nativeElement, false);
    this.setFocusedElement();
    this.onFocus.emit(this);
    this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
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
      this.convertTextToLink(e);
      this.textChanged.next();
      return;
    }
    const html = e.clipboardData.getData('text/html');
    if (html) {
      this.handleHtmlInserting(html);
      this.textChanged.next();
      return;
    }
    const text = e.clipboardData.getData('text/plain');
    const texts = text.split(/(?:\r?\n)+/);
    if (texts.length > 1) {
      this.handleTextsInserting(texts);
      this.textChanged.next();
    } else {
      this.facade.apiBrowser.pasteOnlyTextHandler(e);
      this.textChanged.next();
    }
  }

  handleHtmlInserting(html: string): void {
    const htmlElements = DeltaConverter.splitDeltaByDividers(html);
    if (htmlElements?.length === 0) return;

    const htmlEl = htmlElements[0];
    this.facade.apiBrowser.pasteHTMLHandler(htmlEl); // TODO DONT MUTATE ELEMENT
    const editableEl = this.getEditableNative<HTMLElement>().cloneNode(true) as HTMLElement;
    const resTextBlocks = DeltaConverter.convertHTMLToTextBlocks(editableEl.innerHTML);
    const firstTypeBlock = this.getType(resTextBlocks);
    this.updateContentsAndSync(resTextBlocks);
    htmlElements.shift(); // remove first element

    const textBlocks = htmlElements.map((x) => {
      return DeltaConverter.convertHTMLToTextBlocks(x.outerHTML);
    });
    this.newHTMLTextElements(textBlocks);

    this.transformContent(null, firstTypeBlock.type, firstTypeBlock.heading);
  }

  newHTMLTextElements(textBlocks: TextBlock[][]): void {
    if (textBlocks?.length === 0) return;
    let contentId = this.content.id;
    for (const blocks of textBlocks) {
      if (!this.facade.contentEditorContent.isCanAddContent) {
        break;
      }
      const textType = this.getType(blocks);
      const newTextContent = this.facade.contentEditorTextService.insertNewContent(
        contentId,
        textType.type,
        true,
        blocks,
        textType.heading,
      );
      contentId = newTextContent.content.id;
    }
  }

  getType(contents: TextBlock[]): { type: NoteTextTypeENUM; heading?: HeadingTypeENUM } {
    const content = contents?.find((x) => x.list !== null);
    if (content?.list) {
      if (content.list === DeltaListEnum.bullet) {
        let type = NoteTextTypeENUM.dotList;
        if (content.text?.startsWith('[ ]')) {
          content.text = content.text.slice(3);
          type = NoteTextTypeENUM.checkList;
        }
        return { type };
      }
      if (content.list === DeltaListEnum.ordered) {
        return { type: NoteTextTypeENUM.numberList };
      }
    }
    const headingType = contents?.find((x) => x.header !== null)?.header;
    if (headingType) {
      return { type: NoteTextTypeENUM.heading, heading: this.getHeadingNumber(headingType) };
    }
    return { type: NoteTextTypeENUM.default };
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

  handleTextsInserting(texts: string[]): void {
    const htmlElements = DeltaConverter.textToHtmlElements(texts);
    if (htmlElements.length === 0) return;

    const htmlEl = htmlElements[0];
    this.facade.apiBrowser.pasteHTMLHandler(htmlEl); // TODO DONT MUTATE ELEMENT
    const editableEl = this.getEditableNative<HTMLElement>().cloneNode(true) as HTMLElement;
    const resTextBlocks = DeltaConverter.convertHTMLToTextBlocks(editableEl.innerHTML);
    this.updateContentsAndSync(resTextBlocks);
    htmlElements.shift(); // remove first element

    const textBlocks = htmlElements.map((x) => DeltaConverter.convertHTMLToTextBlocks(x.outerHTML));
    this.newPlainTextElements(textBlocks);
  }

  newPlainTextElements(textBlocks: TextBlock[][]): void {
    if (textBlocks?.length === 0) return;
    let contentId = this.content.id;
    for (const blocks of textBlocks) {
      if (!this.facade.contentEditorContent.isCanAddContent) {
        break;
      }
      const newTextContent = this.facade.contentEditorTextService.insertNewContent(
        contentId,
        NoteTextTypeENUM.default,
        true,
        blocks,
      );
      contentId = newTextContent.content.id;
    }
  }

  convertTextToLink(e: ClipboardEvent) {
    const json = e.clipboardData.getData('text/link-preview') as any;
    const data = JSON.parse(json);
    const title = data.title;
    const url = data.url;
    const pos = this.getSelection();
    const html = DeltaConverter.convertTextBlocksToHTML(this.content.contents);
    const resultDelta = DeltaConverter.insertLink(html, pos.start, title, url);
    const resTextBlocks = DeltaConverter.convertDeltaToTextBlocks(resultDelta);
    this.updateContentsAndSync(resTextBlocks);
  }

  checkForDeleteOrConcatWithPrev($event: KeyboardEvent) {
    if (this.editorSelectionMode === EditorSelectionModeEnum.None) {
      return;
    }

    if (this.editorSelectionMode === EditorSelectionModeEnum.DefaultSelectionEmpty || this.editorSelectionMode === EditorSelectionModeEnum.DefaultSelection) {
      $event.stopPropagation();
    }

    if (this.editorSelectionMode === EditorSelectionModeEnum.DefaultSelectionEmpty &&
      this.facade.apiBrowser.isStart(this.getEditableNative()) &&
      !this.isContentEmpty()) {
      $event.stopPropagation();
      $event.preventDefault();
      this.concatThisWithPrev.emit(this);
      return;
    }

    if (this.editorSelectionMode === EditorSelectionModeEnum.MultiplyRows || this.editorSelectionMode === EditorSelectionModeEnum.EntireRow) {
      return;
    }

    if (this.isContentEmpty()) {
      $event.stopPropagation();
      $event.preventDefault();
      this.deleteThis.emit(this.content.id);
    }
  }

  setHandlers() {
    const el = this.getEditableNative<HTMLElement>();
    const blur = this.facade.renderer.listen(el, 'blur', (e) => {
      this.onBlur(e);
    });
    const copy = this.facade.renderer.listen(el, 'copy', (e: ClipboardEvent) => {
      e.stopPropagation();
    });
    const paste = this.facade.renderer.listen(el, 'paste', (e) => {
      const action = () => this.pasteCommandHandler(e);
      this.saveAndRestoreCursor(action);
      this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
    });
    const selectStart = this.facade.renderer.listen(el, 'selectstart', (e) => {
      // this.onSelectStart(e);
    });
    const keydownEnter = this.facade.renderer.listen(el, 'keydown.enter', (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.facade.contentEditorContent.isCanAddContent) {
        this.enter(e);
      }
    });
    const keydownBackspace = this.facade.renderer.listen(el, 'keydown.backspace', (e: KeyboardEvent) => {
      // e.stopPropagation();
      this.checkForDeleteOrConcatWithPrev(e);
    });
    const keyupBackspace = this.facade.renderer.listen(el, 'keyup.backspace', (e: KeyboardEvent) => {
      // e.stopPropagation();
      this.backUp(e);
    });
    const keydownDelete = this.facade.renderer.listen(el, 'keydown.delete', (e: KeyboardEvent) => {
      // e.stopPropagation();
      this.checkForDeleteOrConcatWithPrev(e);
    });
    const keydown = this.facade.renderer.listen(el, 'keydown', (e: KeyboardEvent) => {
      const isEmpty = !this.getText() || this.getText.length === 0;
      if (isEmpty && e.code === 'Slash') {
        this.onFirstSlash(e);
      }
    });
    this.listeners.push(
      blur,
      paste,
      selectStart,
      keydownBackspace,
      keydownEnter,
      keyupBackspace,
      keydownDelete,
      copy,
      keydown
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
  backUp(e) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onBlur(e) { }

  textClick(e: MouseEvent): void {
    this.facade.clickableService.cursorChanged$.next(() => this.updateContentEditableCursor());
    this.cdr.detectChanges();
    // this.facade.apiBrowser.createCustomRange(this.contentHtml.nativeElement, fC.start);
    const target = e.target as HTMLAnchorElement;
    if (target.localName === 'a' && target.href) {
      e.preventDefault();
      window.open(target.href, '_blank');
    }
  }

  updateContentEditableCursor(): void {
    const position = this.getSelection();
    if (position) {
      this.updateCursor(position.start, position.end);
    }
  }

  updateCursor(start: number, end: number): void {
    const color = this.facade.store.selectSnapshot(NoteStore.cursorColor);
    const noteId = this.facade.store.selectSnapshot(NoteStore.oneFull).id;
    const cursor = new UpdateCursor(color).initTextCursor(this.content.id, start, end);
    this.facade.store.dispatch(new UpdateCursorAction(noteId, cursor));
  }

  saveAndRestoreCursor(action: () => void) {
    const el = this.contentHtml.nativeElement;
    const savedSel = this.getSelection();
    action();
    this.facade.apiBrowser.restoreSelection(el, savedSel);
  }

  getTextCursors(): Observable<TextCursor[]> {
    const userId = this.facade.store.selectSnapshot(UserStore.getUser).id;
    return this.cursors$?.pipe(
      map((x) => {
        return x
          .filter(
            (q) =>
              q.userId !== userId &&
              q.entityId === this.content.id &&
              q.type === CursorTypeENUM.text,
          )
          .map((t) => new TextCursor(t.startCursor, t.endCursor, t.color));
      }),
    );
  }

  mapCursor(cursor: TextCursor): TextCursorUI {
    if (!this.contentHtml?.nativeElement) return null;
    const el = this.contentHtml.nativeElement as HTMLElement;
    const elRects = el.getBoundingClientRect();
    const selection: SaveSelection = {
      start: cursor.startCursor,
      end: cursor.endCursor,
    };
    if (this.isContentEmpty()) {
      return new TextCursorUI(this.cursorShift.left, this.cursorShift.top, cursor.color);
    }
    const range = this.facade.apiBrowser.restoreSelection(el, selection, false);
    const pos = range.getBoundingClientRect();
    const cursorLeft = pos.left - elRects.left + this.cursorShift.left;
    const cursorTop = pos.top - elRects.top + this.cursorShift.top;
    return new TextCursorUI(cursorLeft, cursorTop, cursor.color);
  }

  private updateNativeHTML(html: string): void {
    this.contentHtml.nativeElement.innerHTML = html;
  }

  onFirstSlash($event: KeyboardEvent): void { }

  abstract enter(e);

  abstract setFocusedElement(): void;

  abstract isFocusToNext(entity?: SetFocus);
  abstract getHost();
  abstract backspaceUp();
  abstract backspaceDown();
  abstract deleteDown();
  // eslint-disable-next-line @typescript-eslint/member-ordering
  abstract get cursorShift(): { top: number; left: number };
}
