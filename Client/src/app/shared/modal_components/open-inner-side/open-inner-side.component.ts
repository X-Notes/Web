import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotesService } from 'src/app/content/notes/notes.service';
import { LoadAllExceptNotes, LoadPrivateNotes, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { EntityType } from '../../enums/EntityTypes';
import { FontSize } from '../../enums/FontSize';
import { NoteType } from '../../enums/NoteTypes';
import { MurriService } from '../../services/murri.service';
import { PersonalizationService, showDropdown } from '../../services/personalization.service';

@Component({
  selector: 'app-open-inner-side',
  templateUrl: './open-inner-side.component.html',
  styleUrls: ['./open-inner-side.component.scss'],
  animations: [ showDropdown ],
  providers: [ MurriService, NotesService ]
})
export class OpenInnerSideComponent implements OnInit {

  isOpenDropdown = false;
  loaded = false;
  fontSize = FontSize;
  destroy = new Subject<void>();
  selectTypes = ['All', 'Personal', 'Shared', 'Archive', 'Bin']

  public positions = [
    new ConnectionPositionPair({
        originX: 'end',
        originY: 'bottom'},
        {overlayX: 'end',
        overlayY: 'top'},
        0,
        1)
  ];
  constructor(private store: Store,
              public murriService: MurriService,
              public pService: PersonalizationService,
              public noteService: NotesService) { }

  async ngOnInit(): Promise<void> {
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
    await this.murriService.initMurriNoteAsync(NoteType.Private, false);
    await this.murriService.setOpacityTrueAsync();

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

  closeDropdown() {
    this.isOpenDropdown = false
  }

}
