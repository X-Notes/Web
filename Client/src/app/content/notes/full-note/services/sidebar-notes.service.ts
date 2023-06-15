import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { DialogsManageService } from '../../../navigation/services/dialogs-manage.service';
import { RelatedNote } from '../../models/related-note.model';
import { SmallNote } from '../../models/small-note.model';
import { MenuButtonsService } from 'src/app/content/navigation/services/menu-buttons.service';
import { MurriEntityService } from 'src/app/shared/services/murri-entity.service';
import { SignalRService } from 'src/app/core/signal-r.service';
import { Store } from '@ngxs/store';
import { UpdatePositionsRelatedNotes } from '../../state/notes-actions';
import { RelatedNotesService } from './related-notes.service';

@Injectable()
export class SidebarNotesService extends MurriEntityService<RelatedNote> implements OnDestroy {
  destroy = new Subject<void>();

  noteId: string;

  isCanEdit: boolean;

  constructor(
    murriService: MurriService,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
    private signalR: SignalRService,
    private store: Store,
    private relatedNotesService: RelatedNotesService,
  ) {
    super(murriService);

    this.signalR.updateRelationNotes$.pipe(takeUntil(this.destroy)).subscribe(async (updates) => {
      await this.relatedNotesService.handleUpdates(updates, this.noteId);
      this.entities = this.relatedNotesService.notes;
      requestAnimationFrame(() => this.murriService.sortByHtml());
    });
  }

  syncPositions(): void {
    if (!this.isCanEdit) return;
    const command = new UpdatePositionsRelatedNotes(this.murriService.getPositions(), this.noteId);
    this.store.dispatch(command);
  }

  ngOnDestroy(): void {
    console.log('destroy related');
    this.destroy.next();
    this.destroy.complete();
  }

  async initializeEntities(noteId: string, isCanEdit: boolean) {
    this.noteId = noteId;
    this.isCanEdit = isCanEdit;
    this.relatedNotesService.clearRelatedNotes();
    await this.relatedNotesService.loadRelatedNotes(noteId);
    this.entities = this.relatedNotesService.notes;
  }

  murriInitialise(refElements: QueryList<ElementRef>, noteId: string) {
    refElements.changes
      .pipe(takeUntil(this.destroy))
      .subscribe(async (q: QueryList<ElementRef>) => {
        if (this.needFirstInit()) {
          this.initState();
          await this.murriService.initRelatedNotesAsync(noteId);
          await this.setFirstInitedMurri();
          this.murriService.setOpacity1();
        }
        await this.synchronizeState(q.toArray());
      });
  }

  async deleteSmallNote(relatedNoteId: string, noteId: string) {
    await this.relatedNotesService.deleteRelatedNote(relatedNoteId, noteId);
    this.entities = this.relatedNotesService.notes;
    requestAnimationFrame(() => this.murriService.refreshAndLayout());
  }

  openSideModal(noteId: string) {
    const instance = this.dialogsManageService.openAddRemoveRelatedNotesModal();
    instance
      .afterClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe(async (notes: SmallNote[]) => {
        if (notes) {
          const ids = notes.map((x) => x.id);
          await this.relatedNotesService.updateRelatedNotes(noteId, ids);
          this.entities = this.relatedNotesService.notes;
          requestAnimationFrame(() => this.murriService.refreshAndLayout());
        }
      });
  }

  async changeState(note: RelatedNote) {
    await this.relatedNotesService.changeOpenCloseState(note);
    requestAnimationFrame(() => this.murriService.refreshAndLayout());
  }
}
