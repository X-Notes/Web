import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { Observable } from 'rxjs';
import { NotesService } from '../notes.service';
import { NoteStore } from '../state/notes-state';
import { UnSelectAllNote } from '../state/notes-actions';
import { SignalRService } from 'src/app/core/signal-r.service';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { BaseNotesComponent } from '../base-notes-component';

@Component({
  selector: 'app-shared',
  templateUrl: './shared.component.html',
  styleUrls: ['./shared.component.scss'],
  providers: [NotesService],
})
export class SharedComponent
  extends BaseNotesComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Select(NoteStore.sharedCount)
  sharedCount$: Observable<number>;

  @Select(UserStore.getUserFontSize)
  public fontSize$?: Observable<EntitiesSizeENUM>;
  
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = EntitiesSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    noteService: NotesService,
    private signalRService: SignalRService,
  ) {
    super(noteService);
  }

  ngAfterViewInit(): void {
    this.noteService.murriInitialise();
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteShared)).toPromise();
    this.pService.setSpinnerState(true);
    await this.loadContent();
  }

  async loadContent(typeENUM = NoteTypeENUM.Shared) {
    await this.noteService.loadNotes(typeENUM);

    await this.noteService.initializeEntities();

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;

    this.signalRService.addNotesToSharedEvent$
      .pipe(takeUntil(this.noteService.destroy))
      .subscribe((notes) => {
        if (notes && notes.length > 0) {
          this.noteService.loadNoteAndAddToDom(notes);
          this.signalRService.addNotesToSharedEvent$.next([]);
        }
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
  }
}
