/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { updateNoteTitleDelay } from 'src/app/core/defaults/bounceDelay';
import { UpdateNoteTitle } from '../../state/notes-actions';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { BaseUndoAction } from '../content-editor-services/models/undo/base-undo-action';
import { UndoActionTypeEnum } from '../content-editor-services/models/undo/undo-action-type.enum';
import { UpdateTitleAction } from '../content-editor-services/models/undo/update-title-action';
import { EditorBaseComponent } from './editor-base.component';
import { SaveSelection } from '../../models/browser/save-selection';
import { NoteStore } from '../../state/notes-state';
import { UpdateCursor } from '../models/cursors/cursor';
import { UpdateCursorAction } from '../../state/editor-actions';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { TextCursor } from '../full-note-components/cursors/text-cursor';
import { TextCursorUI } from '../full-note-components/cursors/text-cursor-ui';
import { CursorTypeENUM } from '../models/cursors/cursor-type.enum';
import { ComponentType, ParentInteractionHTML } from '../models/parent-interaction.interface';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export class EditorTitleComponent extends EditorBaseComponent {
  @Input()
  title$?: Observable<string>;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef<HTMLElement>;

  prevTitle: string;

  intervalEvents = interval(updateNoteTitleDelay);

  private noteTitleChanged$: Subject<string> = new Subject<string>();

  get titleUI(): string {
    return this.noteTitleEl.nativeElement.textContent;
  }

  initTitle() {
    this.subscribeUpdates();
    if (!this.isReadOnlyMode) {
      this.subscribeOnEditUI();
    }
  }

  // WS && INTERNAL
  private subscribeUpdates() {
    this.title$
      .pipe(takeUntil(this.facade.dc.d$), debounceTime(updateNoteTitleDelay))
      .subscribe((title) => {
        this.updateTitle(title);
        this.prevTitle = title;
        if (!this.titleInited) {
          this.titleInited = true;
          requestAnimationFrame(() => this.setStartCursor());
        }
      });
  }

  isContentEmpty() {
    return this.noteTitleEl?.nativeElement?.textContent.length === 0;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  subscribeOnEditUI(): void {
    this.noteTitleChanged$
      .pipe(takeUntil(this.facade.dc.d$), debounceTime(updateNoteTitleDelay))
      .subscribe(async (title) => {
        if(!this.noteId) return;
        this.facade.store.dispatch(new UpdateNoteTitle(title, this.noteId, true, undefined, false));
        this.facade.htmlTitleService.setCustomOrDefault(title, 'titles.note');
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startTitleSelection($event): void {
    this.facade.selectionService.disableDiv$.next(true);
  }

  pasteCommandHandler(e) {
    this.facade.apiBrowser.pasteOnlyTextHandler(e);
    this.pushChangesToTitle(this.noteTitleEl.nativeElement.innerText, true);
  }

  private updateTitle(updateTitle: string) {
    if (
      this.noteTitleEl?.nativeElement &&
      updateTitle !== this.noteTitleEl?.nativeElement.textContent
    ) {
      const el = this.noteTitleEl.nativeElement;
      const data = this.facade.apiBrowser.saveRangePositionTextOnly(el);

      this.setTitle(updateTitle);

      if (this.titleInited) {
        requestAnimationFrame(() => this.facade.apiBrowser.setCaretFirstChild(el, data));
      }

      this.facade.htmlTitleService.setCustomOrDefault(updateTitle, 'titles.note');
      this.facade.cdr.detectChanges();
    }
  }

  onTitleInput($event) {
    this.pushChangesToTitle($event.target.innerText, true);
  }

  onTitleClick(): void {
    this.facade.clickableContentService.currentItem?.detectChanges();
    this.facade.clickableContentService.cursorChanged$.next(() => this.updateTitleCursor());
  }

  handlerTitleEnter($event: Event): void {
    $event.preventDefault();
    const content = this.facade.contentEditorTextService.appendNewEmptyContentToStart();
    const action = new BaseUndoAction(UndoActionTypeEnum.deleteContent, content.id);
    this.facade.momentoStateService.saveToStack(action);
    setTimeout(() => this.first?.setFocus());
    this.postAction();
  }

  setTitle(title: string) {
    this.noteTitleEl.nativeElement.innerText = title;
  }

  pushChangesToTitle(title: string, handleUndo: boolean): void {
    if (handleUndo) {
      this.handleUndoTitle(title);
    }
    this.noteTitleChanged$.next(title);
    this.facade.htmlTitleService.setCustomOrDefault(title, 'titles.note');
  }

  handleUndoTitle(title: string): void {
    const action = new UpdateTitleAction(this.prevTitle);
    this.facade.momentoStateService.saveToStack(action);
    this.prevTitle = title;
  }

  getSelection(): SaveSelection | null {
    const el = this.noteTitleEl?.nativeElement;
    if (!el) return null;
    return this.facade.apiBrowser.getSelectionInfo(el);
  }

  updateTitleCursor(): void {
    const position = this.getSelection();
    if (position) {
      this.updateCursor(position.start, position.end);
    }
  }

  updateCursor(start: number, end: number): void {
    const color = this.facade.store.selectSnapshot(NoteStore.cursorColor);
    const noteId = this.facade.store.selectSnapshot(NoteStore.oneFull).id;
    const cursor = new UpdateCursor(color).initTitleCursor(start, end);
    this.facade.store.dispatch(new UpdateCursorAction(noteId, cursor));
  }

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(facade: EditorFacadeService) {
    super(facade);
  }

  // CURSORS

  // eslint-disable-next-line @typescript-eslint/member-ordering
  get titleCursors$(): Observable<TextCursorUI[]> {
    return this.getTextCursors()?.pipe(
      map((x) => {
        return x.map((q) => this.mapCursor(q)).filter((q) => q);
      }),
    );
  }

  getTextCursors(): Observable<TextCursor[]> {
    const userId = this.facade.store.selectSnapshot(UserStore.getUser).id;
    return this.cursors$?.pipe(
      map((x) => {
        return x
          .filter((q) => q.userId !== userId && q.type === CursorTypeENUM.title)
          .map((t) => new TextCursor(t.startCursor, t.endCursor, t.color));
      }),
    );
  }

  get cursorShift() {
    return { top: 8, left: -1 };
  }

  mapCursor(cursor: TextCursor): TextCursorUI {
    if (!this.noteTitleEl?.nativeElement) return null;
    const el = this.noteTitleEl.nativeElement as HTMLElement;
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

  setStartCursor(): void {
    if (this.titleUI.length === 0) {
      this.noteTitleEl?.nativeElement?.focus();
      return;
    }
    const first = this.first;
    const isHtmlFirst = first && first.type === ComponentType.HTML;
    if (isHtmlFirst && (first as ParentInteractionHTML).getText().length === 0) {
      first.setFocus();
    }
  }
}
