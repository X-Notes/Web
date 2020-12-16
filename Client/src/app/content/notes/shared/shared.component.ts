import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { UnSelectAllNote, LoadSharedNotes, LoadAllExceptNotes } from '../state/notes-actions';
import { takeUntil } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/enums/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';
import { AppStore } from 'src/app/core/stateApp/app-state';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [NotesService]
})
export class SharedComponent implements OnInit, OnDestroy {

  fontSize = FontSize;
  destroy = new Subject<void>();
  loaded = false;
  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public noteService: NotesService
  ) { }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteShared)).toPromise();
    this.pService.setSpinnerState(true);
    this.store.select(AppStore.getTokenUpdated)
    .pipe(takeUntil(this.destroy))
    .subscribe(async (x: boolean) => {
      if (x) {
        await this.loadContent();
      }
    }
    );

  }

  async loadContent() {
    await this.store.dispatch(new LoadSharedNotes()).toPromise();

    this.store.dispatch(new LoadAllExceptNotes(NoteType.Shared));

    let notes = this.store.selectSnapshot(NoteStore.sharedNotes);
    notes = this.noteService.transformNotes(notes);
    this.noteService.firstInit(notes);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
    await this.murriService.initMurriNoteAsync(NoteType.Shared, !this.noteService.isFiltedMode());
    await this.murriService.setOpacityTrueAsync();
  }


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }


}
