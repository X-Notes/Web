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
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { MurriService } from 'src/app/shared/services/murri.service';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { NotesService } from '../notes.service';
import { NoteStore } from '../state/notes-state';
import { UnSelectAllNote } from '../state/notes-actions';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss'],
  providers: [NotesService],
})
export class ArchiveComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('item', { read: ElementRef }) refElements: QueryList<ElementRef>;

  fontSize = FontSizeENUM;

  destroy = new Subject<void>();

  loaded = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public murriService: MurriService,
    public noteService: NotesService,
  ) {}

  async ngOnInit() {
    await this.store.dispatch(new UpdateRoute(EntityType.NoteArchive)).toPromise();
    this.pService.setSpinnerState(true);
    this.pService.setIllustrationState(false);

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
    this.noteService.murriInitialise(this.refElements, NoteTypeENUM.Archive);
  }

  async loadContent(typeENUM = NoteTypeENUM.Archive) {
    await this.noteService.loadNotes(typeENUM);

    this.noteService.firstInit();

    await this.pService.waitPreloading();
    this.pService.setSpinnerState(false);
    this.loaded = true;
    this.store
      .select(NoteStore.archiveCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (!x) {
          this.pService.setIllustrationState(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.murriService.flagForOpacity = false;
    this.murriService.muuriDestroy();
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new UnSelectAllNote());
  }
}
