import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AudioService } from '../../content/notes/audio.service';
import { DeltaConverter } from 'src/app/editor/converter/delta-converter';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-public-note',
  templateUrl: './public-note.component.html',
  styleUrls: ['./public-note.component.scss'],
})
export class PublicNoteComponent implements OnInit {
  @Select(NoteStore.isFullNoteEditor)
  isFullNoteEditor$?: Observable<boolean>;

  folderId: string;

  noteId: string;

  get redirectUrl(): string {
    return this.folderId ? `folders/${this.folderId}/${this.noteId}` : `notes/${this.noteId}`;
  }

  constructor(private readonly route: ActivatedRoute, public readonly audioService: AudioService) {
    this.route.params.pipe(takeUntilDestroyed()).subscribe(async (params) => {
      this.noteId = params.id;
      const maybeFolderId = await this.tryGetFolderId();
      this.folderId = typeof maybeFolderId === 'string' ? maybeFolderId : null;
    });
  }

  async ngOnInit(): Promise<void> {
    DeltaConverter.initQuill();
  }

  private tryGetFolderId() {
    return new Promise<string>((resolve) => {
      this.route.queryParams.pipe(take(1)).subscribe((v) => {
        resolve(v.folderId);
      });
    });
  }
}
