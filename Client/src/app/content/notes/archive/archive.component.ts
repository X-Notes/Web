import { Component, OnInit, OnDestroy, AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { LoadArchiveNotes, UnSelectAllNote, LoadAllExceptNotes } from '../state/notes-actions';
import { takeUntil } from 'rxjs/operators';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/models/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeNaming } from 'src/app/shared/enums/FontSizeNaming';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  providers: [NotesService]
})
export class ArchiveComponent implements OnInit, OnDestroy, AfterViewInit {

  fontSize = FontSizeNaming;
  destroy = new Subject<void>();
  loaded = false;
  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public noteService: NotesService) { }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteArchive)).toPromise();
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

  ngAfterViewInit(): void {
    this.noteService.murriInitialise(this.refElements, NoteType.Archive);
  }

  async loadContent() {
    await this.store.dispatch(new LoadArchiveNotes()).toPromise();
    this.store.dispatch(new LoadAllExceptNotes(NoteType.Archive));


    let notes = this.store.selectSnapshot(NoteStore.archiveNotes);
    notes = this.noteService.transformNotes(notes);
    this.noteService.firstInit(notes);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }
}
