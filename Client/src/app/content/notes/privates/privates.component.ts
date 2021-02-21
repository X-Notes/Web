import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LoadPrivateNotes, UnSelectAllNote, LoadAllExceptNotes } from '../state/notes-actions';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { NoteType } from 'src/app/shared/enums/NoteTypes';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { NoteStore } from '../state/notes-state';
import { FontSize } from 'src/app/shared/models/FontSize';
import { MurriService } from 'src/app/shared/services/murri.service';
import { NotesService } from '../notes.service';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeNaming } from 'src/app/shared/enums/FontSizeNaming';

@Component({
  selector: 'app-privates',
  templateUrl: './privates.component.html',
  styleUrls: ['./privates.component.scss'],
  providers: [NotesService]
})
export class PrivatesComponent implements OnInit, OnDestroy, AfterViewInit {

  fontSize = FontSizeNaming;
  destroy = new Subject<void>();
  loaded = false;
  @ViewChildren('item', { read: ElementRef,  }) refElements: QueryList<ElementRef>;

  constructor(public pService: PersonalizationService,
              private store: Store,
              public murriService: MurriService,
              public noteService: NotesService) { }

  ngAfterViewInit(): void {
    this.noteService.murriInitialise(this.refElements, NoteType.Private);
  }


  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NotePrivate)).toPromise();
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
    await this.store.dispatch(new LoadPrivateNotes()).toPromise();
    this.store.dispatch(new LoadAllExceptNotes(NoteType.Private));

    let notes = this.store.selectSnapshot(NoteStore.privateNotes);
    notes = this.noteService.transformNotes(notes);
    this.noteService.firstInit(notes);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.store.select(NoteStore.notesAddingPrivate)
      .pipe(takeUntil(this.destroy))
      .subscribe(x => this.noteService.addToDom(x));
  }


  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }
}
