import { ElementRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MurriService } from 'src/app/shared/services/murri.service';
import { DialogsManageService } from '../../../navigation/services/dialogs-manage.service';
import { ApiRelatedNotesService } from '../../api-related-notes.service';
import { RelatedNote } from '../../models/related-note.model';
import { SmallNote } from '../../models/small-note.model';
import { MenuButtonsService } from 'src/app/content/navigation/services/menu-buttons.service';
import { MurriEntityService } from 'src/app/shared/services/murri-entity.service';
import { SignalRService } from 'src/app/core/signal-r.service';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { Store } from '@ngxs/store';
import { UpdatePositionsRelatedNotes } from '../../state/notes-actions';

@Injectable()
export class SidebarNotesService extends MurriEntityService<RelatedNote> implements OnDestroy {
  destroy = new Subject<void>();

  noteId: string;

  isCanEdit: boolean;

  constructor(
    private apiRelated: ApiRelatedNotesService,
    murriService: MurriService,
    public buttonService: MenuButtonsService,
    public dialogsManageService: DialogsManageService,
    private signalR: SignalRService,
    private store: Store,
  ) {
    super(murriService);

    this.signalR.updateRelationNotes
      .pipe(takeUntil(this.destroy))
      .subscribe(async (updates) => this.handleUpdates(updates));
  }

  async handleUpdates(updates: UpdateRelatedNotesWS): Promise<void> {
    if (!updates) return;
    if (updates.idsToRemove && updates.idsToRemove.length > 0) {
      this.deleteFromDom(updates.idsToRemove);
    }
    if (updates.idsToAdd && updates.idsToAdd.length > 0) {
      const newNotes = await this.apiRelated.getRelatedNotes(this.noteId).toPromise();
      const filterNotes = newNotes.filter((q) => updates.idsToAdd.some((s) => s === q.id));
      this.addToDom(filterNotes);
    }
    if (updates.positions) {
      updates.positions.forEach((pos) => {
        const ent = this.entities.find((q) => q.id === pos.entityId);
        ent.order = pos.position;
      });
      requestAnimationFrame(() => this.murriService.sortByHtml());
    }
  }

  updatePositions(): void {
    if (!this.isCanEdit) return;
    const command = new UpdatePositionsRelatedNotes(this.murriService.getPositions(), this.noteId);
    this.store.dispatch(command);
  }

  ngOnDestroy(): void {
    console.log('destroy related');
    super.destroyLayout();
    this.destroy.next();
    this.destroy.complete();
  }

  async initializeEntities(noteId: string, isCanEdit: boolean) {
    this.noteId = noteId;
    this.isCanEdit = isCanEdit;
    const notes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
    this.entities = notes.sort((a, b) => a.order - b.order);
    super.initState();
  }

  murriInitialise(refElements: QueryList<ElementRef>, noteId: string) {
    refElements.changes.pipe(takeUntil(this.destroy)).subscribe(async (z) => {
      if (this.getIsFirstInit(z)) {
        await this.murriService.initSidebarNotesAsync(noteId);
        await this.setInitMurriFlagShowLayout();
      }
      await this.synchronizeState(refElements, false);
    });
  }

  async deleteSmallNote(item: string, id: string) {
    const ids = this.entities.filter((x) => x.id !== item).map((x) => x.id);
    const resp = await this.apiRelated.updateRelatedNotes(id, ids).toPromise();
    if (resp.success) {
      this.handleUpdates(resp.data);
    }
  }

  openSideModal(noteId: string) {
    const instance = this.dialogsManageService.openRelatedNotesModal();
    instance
      .afterClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe(async (notes: SmallNote[]) => {
        if (notes) {
          const ids = notes.map((x) => x.id);
          const resp = await this.apiRelated.updateRelatedNotes(noteId, ids).toPromise();
          if (resp.success) {
            this.handleUpdates(resp.data);
          }
        }
      });
  }

  async changeState(note: RelatedNote) {
    await this.apiRelated.updateState(note.id, note.reletionId, note.isOpened).toPromise();
  }
}
