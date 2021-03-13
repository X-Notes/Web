import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChildren,
  ElementRef,
  QueryList,
} from '@angular/core';
import { Subject } from 'rxjs';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { NoteTypeENUM } from 'src/app/shared/enums/NoteTypesEnum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/EntityTypes';
import { MurriService } from 'src/app/shared/services/murri.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/FontSizeEnum';
import { NotesService } from '../notes.service';
import { NoteStore } from '../state/notes-state';
import { UnSelectAllNote } from '../state/notes-actions';

@Component({
  selector: 'app-deleted',
  templateUrl: './deleted.component.html',
  styleUrls: ['./deleted.component.scss'],
  providers: [NotesService],
})
export class DeletedComponent implements OnInit, OnDestroy, AfterViewInit {
  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  loaded = false;

  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public murriService: MurriService,
    public noteService: NotesService,
  ) {}

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteDeleted)).toPromise();
    this.pService.setSpinnerState(true);
    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          await this.loadContent();
        }
      });
  }

  ngAfterViewInit(): void {
    this.noteService.murriInitialise(this.refElements, NoteTypeENUM.Deleted);
  }

  async loadContent(typeENUM = NoteTypeENUM.Deleted) {
    await this.noteService.loadNotes(typeENUM);

    let notes = this.store.selectSnapshot(NoteStore.deletedNotes);
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
