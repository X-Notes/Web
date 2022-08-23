import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { OperationResultAdditionalInfo } from 'src/app/shared/models/operation-result.model';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { ApiRelatedNotesService } from '../../api-related-notes.service';
import { RelatedNote } from '../../models/related-note.model';

@Injectable({
  providedIn: 'root',
})
export class RelatedNotesService {
  notes: RelatedNote[] = [];

  constructor(
    private apiRelated: ApiRelatedNotesService,
    private snackbarService: SnackbarService,
    private translate: TranslateService) {}

  async updateRelatedNotes(noteId: string, ids: string[]): Promise<void> {
    const resp = await this.apiRelated.updateRelatedNotes(noteId, ids).toPromise();
    if (resp.success) {
      this.handleUpdates(resp.data, noteId);
    }
    if(!resp.success && resp.status === OperationResultAdditionalInfo.BillingError){
      const message = this.translate.instant('snackBar.subscriptionCreationError');
      this.snackbarService.openSnackBar(message, null, null, 5000);
    }
  }

  async loadRelatedNotes(noteId: string): Promise<void> {
    const notes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
    this.orderNotes(notes);
  }

  orderNotes(notes: RelatedNote[]): void {
    this.notes = notes.sort((a, b) => a.order - b.order);
  }

  async changeOpenCloseState(note: RelatedNote): Promise<boolean> {
    const resp = await this.apiRelated
      .updateState(note.id, note.reletionId, note.isOpened)
      .toPromise();
    return resp.success;
  }

  async deleteRelatedNote(relatedNoteId: string, noteId: string): Promise<void> {
    const ids = this.notes.filter((x) => x.id !== relatedNoteId).map((x) => x.id);
    const resp = await this.apiRelated.updateRelatedNotes(noteId, ids).toPromise();
    if (resp.success) {
      this.handleUpdates(resp.data, noteId);
    }
  }

  async handleUpdates(updates: UpdateRelatedNotesWS, noteId: string): Promise<void> {
    if (!updates) return;
    if (updates.idsToRemove && updates.idsToRemove.length > 0) {
      this.notes = this.notes.filter((x) => !updates.idsToRemove.some((z) => z === x.id));
    }
    if (updates.idsToAdd && updates.idsToAdd.length > 0) {
      const newNotes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
      const filterNotes = newNotes.filter((q) => updates.idsToAdd.some((s) => s === q.id));
      this.notes.unshift(...filterNotes);
    }
    if (updates.positions) {
      updates.positions.forEach((pos) => {
        const ent = this.notes.find((q) => q.id === pos.entityId);
        ent.order = pos.position;
      });
    }
    this.orderNotes(this.notes);
  }
}
