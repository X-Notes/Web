import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { Select, Store } from '@ngxs/store';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { Observable } from 'rxjs';
import { NotesService } from '../notes.service';
import { NoteStore } from '../state/notes-state';
import { UnSelectAllNote } from '../state/notes-actions';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { BaseNotesComponent } from '../base-notes-component';

@Component({
  selector: 'app-privates',
  templateUrl: './privates.component.html',
  styleUrls: ['./privates.component.scss'],
  providers: [NotesService],
})
export class PrivatesComponent
  extends BaseNotesComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(NoteStore.privateCount)
  privateCount$: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  fontSize = FontSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    noteService: NotesService,
  ) {
    super(noteService);
  }

  ngAfterViewInit(): void {
    this.noteService.murriInitialise(this.refElements, NoteTypeENUM.Private);
  }

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NotePrivate)).toPromise();
    this.pService.setSpinnerState(true);
    await this.loadContent();
  }

  async loadContent(typeENUM = NoteTypeENUM.Private) {
    await this.noteService.loadNotes(typeENUM);

    await this.noteService.initializeEntities(this.noteService.getNotesByCurrentType);

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new UnSelectAllNote());
  }
}
