import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChildren,
  ElementRef,
  QueryList,
} from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select, Store } from '@ngxs/store';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { NotesService } from '../notes.service';
import { NoteStore } from '../state/notes-state';
import { UnSelectAllNote } from '../state/notes-actions';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [NotesService],
})
export class DeletedComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  @Select(NoteStore.deletedCount)
  deletedCount$: Observable<number>;

  fontSize = FontSizeENUM;

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public noteService: NotesService,
  ) {}

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteDeleted)).toPromise();
    this.pService.setSpinnerState(true);
    await this.loadContent();
  }

  ngAfterViewInit(): void {
    this.noteService.murriInitialise(this.refElements, NoteTypeENUM.Deleted);
  }

  async loadContent(typeENUM = NoteTypeENUM.Deleted) {
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
