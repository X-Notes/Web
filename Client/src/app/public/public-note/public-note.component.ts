import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AudioService } from '../../content/notes/audio.service';
import { DeltaConverter } from '../../content/notes/full-note/content-editor/converter/delta-converter';
import { AppInitializerService } from 'src/app/core/app-initializer.service';

@Component({
  selector: 'app-public-note',
  templateUrl: './public-note.component.html',
  styleUrls: ['./public-note.component.scss'],
})
export class PublicNoteComponent implements OnInit {
  @Select(NoteStore.isFullNoteEditor)
  isFullNoteEditor$: Observable<boolean>;

  constructor(
    private appInitializerService: AppInitializerService,
    public readonly audioService: AudioService,
  ) {}

  async ngOnInit(): Promise<void> {
    DeltaConverter.initQuill();
    await this.appInitializerService.init();
  }
}
