import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ofActionDispatched } from '@ngxs/store';
import { interval, Subject } from 'rxjs';
import { buffer, takeUntil } from 'rxjs/operators';
import { updateNoteTitleDelay } from 'src/app/core/defaults/bounceDelay';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { groupBy } from 'src/app/shared/services/arrays.util';
import { EntityMapperUtil } from 'src/app/shared/services/entity-mapper.util';
import { UpdateNoteTitleWS, UpdateSmallNoteTitle } from '../../../state/notes-actions';
import { EditorTitleEnum } from '../entities/editor-title.enum';
import { EditorFacadeService as EditorFacadeService } from '../services/editor-api-facade.service';
import { TreeRGA } from '../text/rga/tree-rga';
import { MergeTransaction } from '../text/rga/types';
import { EditorBaseComponent } from './edit-base.components';

@Component({
  selector: '',
  template: '',
})
export class EditorTitleComponent extends EditorBaseComponent {
  @Input() titleType?: EditorTitleEnum;

  @ViewChild('noteTitle', { read: ElementRef }) noteTitleEl: ElementRef<HTMLElement>;

  isLoading = false;

  rgaTitle: TreeRGA<string>;

  uiTitle: string;

  intervalEvents = interval(updateNoteTitleDelay);

  private noteTitleChanged = new Subject<{ trans: MergeTransaction<string>; noteId: string }>();

  async initTitle() {
    if (!this.titleType) {
      throw Error('Title must be provider');
    }
    await this.loadTitle(this.titleType);
    this.facade.cdr.detectChanges();
    if (!this.isReadOnlyMode) {
      this.subscribeOnEditUI();
    }
    this.subscribeUpdates();
  }

  async reInitTitle() {
    this.isLoading = true;
    if (!this.titleType) {
      throw Error('Title must be provider');
    }
    this.rgaTitle = null;
    this.uiTitle = null;
    await this.loadTitle(this.titleType);
    this.isLoading = false;
    this.facade.cdr.detectChanges();
  }

  private async loadTitle(titleType: EditorTitleEnum) {
    switch (titleType) {
      case EditorTitleEnum.Note: {
        const note = await this.facade.apiNote.get(this.noteId).toPromise();
        if (note) {
          this.rgaTitle = EntityMapperUtil.transformTreeRga(note.data.title);
          this.uiTitle = this.rgaTitle.readStr();
        }
        break;
      }
      case EditorTitleEnum.Snapshot: {
        const note = await this.facade.apiNoteHistoryService
          .getSnapshot(this.noteId, this.snapshotId)
          .toPromise();
        if (note) {
          this.uiTitle = note.data.noteSnapshot.title;
        }
        break;
      }
      default: {
        throw Error('Incorrect type');
      }
    }
    this.facade.htmlTitleService.setCustomOrDefault(this.uiTitle, 'titles.note');
  }

  subscribeOnEditUI(): void {
    this.noteTitleChanged
      .pipe(takeUntil(this.facade.dc.d$), buffer(this.intervalEvents))
      .subscribe((trans) => {
        if (trans.length > 0) {
          const group = groupBy(trans, (x) => x.noteId);
          for (const noteId in group) {
            const updates = group[noteId].map((x) => x.trans);
            this.updateRgaTitleAPI(updates, noteId);
          }
        }
      });
  }

  subscribeUpdates(): void {
    this.facade.actions$
      .pipe(takeUntil(this.facade.dc.d$), ofActionDispatched(UpdateNoteTitleWS))
      .subscribe((obj: UpdateNoteTitleWS) => {
        if (this.noteId === obj.noteId) {
          this.updateRGATitle(obj.transactions);
        }
      });
  }

  // OUTSIDE UPDATES
  updateRGATitle(trans: MergeTransaction<string>[]) {
    if (this.noteTitleEl?.nativeElement) {
      const el = this.noteTitleEl.nativeElement;
      const data = this.facade.apiBrowser.saveRangePositionTextOnly(el);

      this.rgaTitle.merge(trans);
      this.uiTitle = this.rgaTitle.readStr();

      requestAnimationFrame(() => this.facade.apiBrowser.setCaretFirstChild(el, data));

      this.facade.htmlTitleService.setCustomOrDefault(this.uiTitle, 'titles.note');
      this.facade.cdr.detectChanges();
    }
  }

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

  // INSIDE UPDATES
  async updateRgaTitleAPI(trans: MergeTransaction<string>[], noteId: string): Promise<string> {
    switch (this.titleType) {
      case EditorTitleEnum.Note: {
        const resp = await this.facade.apiNoteText.updateTitle(trans, noteId).toPromise();
        if (resp.success) {
          this.facade.store.dispatch(new UpdateSmallNoteTitle(trans, noteId));
          return this.rgaTitle.readStr();
        }
      }
      default: {
        throw new Error('Type not supported');
      }
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
    setTimeout(() => this.elements?.first?.setFocus());
    this.postAction();
  }

  pushChangesToTitle(title: string): void {
    if (this.isLoading) return;
    const user = this.facade.store.selectSnapshot(UserStore.getUser);
    const operator = this.facade.diffCheckerService.processTextChanges(
      this.rgaTitle,
      title,
      user.agentId,
    );
    operator.apply();
    this.noteTitleChanged.next({ trans: operator.mergeOps, noteId: this.noteId });
    this.facade.htmlTitleService.setCustomOrDefault(title, 'titles.note');
  }

  constructor(facade: EditorFacadeService) {
    super(facade);
  }
}
