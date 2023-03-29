/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteTitleDelay } from 'src/app/core/defaults/bounceDelay';
import { UpdateNoteTitle } from '../../state/notes-actions';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { BaseUndoAction } from '../content-editor-services/models/undo/base-undo-action';
import { UndoActionTypeEnum } from '../content-editor-services/models/undo/undo-action-type.enum';
import { UpdateTitleAction } from '../content-editor-services/models/undo/update-title-action';
import { EditorBaseComponent } from './editor-base.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export class EditorTitleComponent extends EditorBaseComponent {
  @Input()
  title$: Observable<string>;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef<HTMLElement>;

  prevTitle: string;

  inited = false;

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
        if (!this.inited) {
          this.prevTitle = title;
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  subscribeOnEditUI(): void {
    this.noteTitleChanged$
      .pipe(takeUntil(this.facade.dc.d$), debounceTime(updateNoteTitleDelay))
      .subscribe(async (title) => {
        this.facade.store.dispatch(new UpdateNoteTitle(title, this.noteId, true, null, false));
        this.facade.htmlTitleService.setCustomOrDefault(title, 'titles.note');
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startTitleSelection($event): void {
    this.facade.selectionService.disableDiv = true;
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

      requestAnimationFrame(() => this.facade.apiBrowser.setCaretFirstChild(el, data));

      this.facade.htmlTitleService.setCustomOrDefault(updateTitle, 'titles.note');
      this.facade.cdr.detectChanges();
    }
  }

  onTitleInput($event) {
    this.pushChangesToTitle($event.target.innerText, true);
  }

  onTitleClick(): void {
    this.facade.clickableContentService.currentItem?.detectChanges();
  }

  handlerTitleEnter($event: KeyboardEvent) {
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

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(facade: EditorFacadeService) {
    super(facade);
  }
}
