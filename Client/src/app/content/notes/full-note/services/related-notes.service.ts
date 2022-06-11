import { Injectable } from '@angular/core';
import { UpdateRelatedNotesWS } from 'src/app/core/models/signal-r/innerNote/update-related-notes-ws';
import { OperationResult } from 'src/app/shared/models/operation-result.model';
import { ApiRelatedNotesService } from '../../api-related-notes.service';
import { RelatedNote } from '../../models/related-note.model';

@Injectable({
  providedIn: 'root',
})
export class RelatedNotesService {
  notes: RelatedNote[] = [];

  constructor(private apiRelated: ApiRelatedNotesService) {}

  async loadRelatedNotes(noteId: string): Promise<void> {
    const notes = await this.apiRelated.getRelatedNotes(noteId).toPromise();
    this.notes = notes.sort((a, b) => a.order - b.order);
  }

  async changeOpenCloseState(note: RelatedNote): Promise<boolean> {
    const resp = await this.apiRelated
      .updateState(note.id, note.reletionId, note.isOpened)
      .toPromise();
    return resp.success;
  }

  async deleteRelatedNote(
    relatedNoteId: string,
    noteId: string,
  ): Promise<OperationResult<UpdateRelatedNotesWS>> {
    const ids = this.notes.filter((x) => x.id !== relatedNoteId).map((x) => x.id);
    const resp = await this.apiRelated.updateRelatedNotes(noteId, ids).toPromise();
    if (resp.data.idsToRemove && resp.data.idsToRemove.length > 0) {
      this.notes = this.notes.filter((x) => !resp.data.idsToRemove.some((q) => q === x.id));
    }
    return resp;
  }
}
