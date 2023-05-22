import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NoteHistory } from 'src/app/content/notes/full-note/models/history/note-history.model';
import { LoadNoteHistories } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { PersonalizationService } from '../../services/personalization.service';

@Component({
  selector: 'app-note-history-pop-up',
  templateUrl: './note-history-pop-up.component.html',
  styleUrls: ['./note-history-pop-up.component.scss'],
})
export class NoteHistoryPopUpComponent implements OnInit {
  @Select(NoteStore.histories)
  public histories$: Observable<NoteHistory[]>;

  loading = false;

  constructor(
    public dialogRef: MatDialogRef<NoteHistoryPopUpComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA)
    public data: { noteId: string },
    public ps: PersonalizationService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.store.dispatch(new LoadNoteHistories(this.data.noteId)).toPromise();
    this.loading = true;
  }
}
