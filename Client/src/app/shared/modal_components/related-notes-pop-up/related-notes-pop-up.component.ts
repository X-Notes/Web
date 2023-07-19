import { AfterViewInit, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { ApiRelatedNotesService } from 'src/app/content/notes/api-related-notes.service';
import { RelatedNote } from 'src/app/content/notes/models/related-note.model';
import { SmallNote } from 'src/app/content/notes/models/small-note.model';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { SignalRService } from 'src/app/core/signal-r.service';
import { OperationResultAdditionalInfo } from '../../models/operation-result.model';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarService } from '../../services/snackbar/snackbar.service';

@Component({
  selector: 'app-related-notes-pop-up',
  templateUrl: './related-notes-pop-up.component.html',
  styleUrls: ['./related-notes-pop-up.component.scss'],
})
export class RelatedNotesPopUpComponent implements OnInit, AfterViewInit, OnDestroy {
  load = false;

  _notes: RelatedNote[];

  destroy = new Subject<void>();

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { canEdit: boolean; noteId: string },
    public dialogRef: MatDialogRef<RelatedNotesPopUpComponent>,
    private dialogsManageService: DialogsManageService,
    private apiRelated: ApiRelatedNotesService,
    private signalR: SignalRService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {}

  get notes(): RelatedNote[] {
    return this._notes?.sort((a, b) => a.order - b.order) ?? [];
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this._notes = await this.apiRelated.getRelatedNotes(this.data.noteId).toPromise();
    this.load = true
  }

  ngAfterViewInit(): void {}

  async changeState(note: RelatedNote) {
    await this.apiRelated.updateState(note.id, note.reletionId, note.isOpened).toPromise();
  }

  async deleteRelatedNote(relatedNoteId: string, noteId: string) {
    const ids = this.notes.filter((x) => x.id !== relatedNoteId).map((x) => x.id);
    const resp = await this.apiRelated.updateRelatedNotes(noteId, ids, this.signalR.connectionIdOrError).toPromise();
    if (resp.success) {
      this.handleUpdates(resp.data, noteId);
    }
  }

  openAddRelatedNotesPopup(): void {
    const instance = this.dialogsManageService.openAddRemoveRelatedNotesModal();
    instance
      .afterClosed()
      .pipe(takeUntil(this.destroy))
      .subscribe(async (notes: SmallNote[]) => {
        if (notes) {
          const ids = notes.map((x) => x.id);
          const resp = await this.apiRelated.updateRelatedNotes(this.data.noteId, ids, this.signalR.connectionIdOrError).toPromise();
          if (resp.success) {
            this.handleUpdates(resp.data, this.data.noteId);
          }
          if (!resp.success && resp.status === OperationResultAdditionalInfo.BillingError) {
            const message = this.translate.instant('snackBar.subscriptionCreationError');
            this.snackbarService.openSnackBar(message, null, null, 5000);
          }
        }
      });
  }

  async handleUpdates(updates: UpdateRelatedNotesWS, noteId: string): Promise<void> {
    if (!updates) return;
    if (updates.idsToRemove && updates.idsToRemove.length > 0) {
      this._notes = this._notes.filter((x) => !updates.idsToRemove.some((q) => q === x.id));
    }
    if (updates.idsToAdd && updates.idsToAdd.length > 0) {
      const newNotes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
      const filterNotes = newNotes.filter((q) => updates.idsToAdd.some((s) => s === q.id));
      this._notes.push(...filterNotes);
    }
    if (updates.positions) {
      updates.positions.forEach((pos) => {
        const ent = this._notes.find((q) => q.id === pos.entityId);
        if (ent) {
          ent.order = pos.position;
        }
      });
    }
  }
}
