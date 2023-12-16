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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { ApiRelatedNotesService } from '../../api-related-notes.service';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';

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
    private apiRelated: ApiRelatedNotesService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {
    super(murriService);

    this.signalR.updateRelationNotes$.pipe(takeUntil(this.destroy)).subscribe(async (updates) => {
      await this.handleUpdates(updates, this.noteId);
      requestAnimationFrame(() => this.murriService.sortByHtml());
    });

    this.murriService.dragEnd$.pipe(takeUntilDestroyed()).subscribe(flag => {
      if (flag) {
        this.syncPositions();
      }
    });
  }

  syncPositions(): void {
    if (!this.isCanEdit) return;
    if (!this.isNeedUpdatePositions) return;
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
    const notes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
    this.entities = notes.sort((a, b) => a.order - b.order);
  }

  murriInitialise(refElements: QueryList<ElementRef>) {
    refElements.changes
      .pipe(takeUntil(this.destroy))
      .subscribe(async (q: QueryList<ElementRef>) => {
        if (this.needFirstInit()) {
          this.initState();
          await this.murriService.initRelatedNotesAsync();
          await this.setFirstInitedMurri();
          this.murriService.setOpacity1();
        }
        await this.synchronizeState(q.toArray());
      });
  }

  async deleteRelatedNote(relatedNoteId: string, noteId: string) {
    const ids = this.entities.filter((x) => x.id !== relatedNoteId).map((x) => x.id);
    const resp = await this.apiRelated.updateRelatedNotes(noteId, ids, this.signalR.connectionIdOrError).toPromise();
    if (resp.success) {
      this.handleUpdates(resp.data, noteId);
    }
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
          const resp = await this.apiRelated.updateRelatedNotes(noteId, ids, this.signalR.connectionIdOrError).toPromise();
          if (resp.success) {
            this.handleUpdates(resp.data, noteId);
          }
          if (!resp.success && resp.status === OperationResultAdditionalInfo.BillingError) {
            const message = this.translate.instant('snackBar.subscriptionCreationError');
            this.snackbarService.openSnackBar(message, null, null, 5000);
          }
          requestAnimationFrame(() => this.murriService.refreshAndLayout());
        }
      });
  }

  async changeState(note: RelatedNote) {
    const resp = await this.apiRelated
      .updateState(this.noteId, note.relationId, note.isOpened)
      .toPromise();
    if (resp.success) {
      requestAnimationFrame(() => this.murriService.refreshAndLayout());
    }
  }

  async handleUpdates(updates: UpdateRelatedNotesWS, noteId: string): Promise<void> {
    if (!updates) return;
    if (updates.idsToRemove && updates.idsToRemove.length > 0) {
      this.deleteFromDom(updates.idsToRemove);
    }
    if (updates.idsToAdd && updates.idsToAdd.length > 0) {
      const newNotes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
      const filterNotes = newNotes.filter((q) => updates.idsToAdd.some((s) => s === q.id));
      this.addToDom(filterNotes);
    }
    if (updates.positions) {
      updates.positions.forEach((pos) => {
        const ent = this.entities.find((q) => q.id === pos.entityId);
        if (ent) {
          ent.order = pos.position;
        }
      });
      //await this.resetLayoutAsync();
      //this.entities = this.entities.sort((a, b) => a.order - b.order);
    }
  }
}
