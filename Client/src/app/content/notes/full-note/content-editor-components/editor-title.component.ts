/* eslint-disable @typescript-eslint/member-ordering */
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { interval, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { updateNoteTitleDelay } from 'src/app/core/defaults/bounceDelay';
import { UpdateNoteTitle } from '../../state/notes-actions';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
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

  uiTitle: string;

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

  private subscribeUpdates() {
    this.title$
      .pipe(takeUntil(this.facade.dc.d$), debounceTime(updateNoteTitleDelay))
      .subscribe((title) => this.updateTitle(title));
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  subscribeOnEditUI(): void {
    this.noteTitleChanged$
      .pipe(takeUntil(this.facade.dc.d$), debounceTime(updateNoteTitleDelay))
      .subscribe((title) => {
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
    this.pushChangesToTitle(this.noteTitleEl.nativeElement.innerText);
  }

  updateTitle(updateTitle: string) {
    if (
      this.noteTitleEl?.nativeElement &&
      updateTitle !== this.noteTitleEl?.nativeElement.textContent
    ) {
      const el = this.noteTitleEl.nativeElement;
      const data = this.facade.apiBrowser.saveRangePositionTextOnly(el);

      this.uiTitle = updateTitle;

      requestAnimationFrame(() => this.facade.apiBrowser.setCaretFirstChild(el, data));

      this.facade.htmlTitleService.setCustomOrDefault(this.uiTitle, 'titles.note');
      this.facade.cdr.detectChanges();
    }
  }

  onTitleInput($event) {
    this.pushChangesToTitle($event.target.innerText);
  }

  onTitleClick(): void {
    this.facade.clickableContentService.currentItem?.detectChanges();
  }

  handlerTitleEnter($event: KeyboardEvent) {
    $event.preventDefault();
    this.facade.contentEditorTextService.appendNewEmptyContentToStart();
    setTimeout(() => this.first?.setFocus());
    this.postAction();
  }

  pushChangesToTitle(title: string): void {
    this.noteTitleChanged$.next(title);
    this.facade.htmlTitleService.setCustomOrDefault(title, 'titles.note');
  }

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(facade: EditorFacadeService) {
    super(facade);
  }
}
