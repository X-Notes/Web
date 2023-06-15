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
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { BaseNotesComponent } from '../base-notes-component';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [NotesService],
})
export class DeletedComponent
  extends BaseNotesComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @Select(NoteStore.deletedCount)
  deletedCount$: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = EntitiesSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    noteService: NotesService,
  ) {
    super(noteService);
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteDeleted)).toPromise();
    this.pService.setSpinnerState(true);
    await this.loadContent();
  }

  ngAfterViewInit(): void {
    this.noteService.murriInitialise();
  }

  async loadContent(typeENUM = NoteTypeENUM.Deleted) {
    await this.noteService.loadNotes(typeENUM);

    await this.noteService.initializeEntities();

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
  }
}
