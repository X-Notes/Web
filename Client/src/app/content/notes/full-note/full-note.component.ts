import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { SignalRService } from 'src/app/core/signal-r.service';
import { DeleteCurrentNote, LoadFullNote, LoadNotes } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/full-note.model';
import { SmallNote } from '../models/small-note.model';
import { LoadLabels } from '../../labels/state/labels-actions';
import { FullNoteSliderService } from './services/full-note-slider.service';
import { MenuSelectionService } from './content-editor-services/menu-selection.service';
import { ApiServiceNotes } from '../api-notes.service';
import { UpdaterEntitiesService } from '../../../core/entities-updater.service';
import { ContentModelBase } from '../models/editor-models/content-model-base';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
  providers: [FullNoteSliderService],
})
export class FullNoteComponent implements OnInit, OnDestroy {
  @ViewChild('fullWrap') wrap: ElementRef;

  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(NoteStore.canNoView)
  public canNoView$: Observable<boolean>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  public notesLink: SmallNote[];

  loaded = false;

  destroy = new Subject<void>();

  note: FullNote;

  contents: ContentModelBase[];

  id: string;

  private routeSubscription: Subscription;

  constructor(
    route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    public menuSelectionService: MenuSelectionService,
    private api: ApiServiceNotes,
    private signalRService: SignalRService,
    private updateNoteService: UpdaterEntitiesService,
    public sliderService: FullNoteSliderService,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      this.id = params.id;
      this.store
        .select(AppStore.appLoaded)
        .pipe(takeUntil(this.destroy)) // TODO REFACTOR
        .subscribe(async (x: boolean) => {
          if (x) {
            await this.initNote();
            this.store.dispatch(new LoadLabels());
            this.destroy.next();
            this.destroy.complete();
          }
        });
    });
  }

  async initNote() {
    await this.loadMain();
    await this.loadLeftMenuWithNotes();
    await this.signalRService.joinNote(this.id);
    this.signalRService.updateContentEvent
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.loadContent());
  }

  async loadContent() {
    this.contents = await this.api.getContents(this.id).toPromise();
  }

  async loadMain() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    await this.loadContent();
    this.note = this.store.selectSnapshot(NoteStore.oneFull);
    this.loaded = true;
  }

  async loadLeftMenuWithNotes() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const types = Object.values(NoteTypeENUM).filter((z) => typeof z === 'number');
    const actions = types.map((t: NoteTypeENUM) => new LoadNotes(t, pr));

    await this.store.dispatch(actions).toPromise();
    await this.setSideBarNotes(this.note?.noteTypeId);
  }

  async ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.NoteInner));
  }

  panMove(e) {
    this.sliderService.panMove(e, this.wrap);
  }

  panEnd(e) {
    this.sliderService.panEnd(e, this.wrap);
  }

  setSideBarNotes(noteType: NoteTypeENUM) {
    let notes: SmallNote[];
    switch (noteType) {
      case NoteTypeENUM.Deleted: {
        notes = this.store.selectSnapshot(NoteStore.deletedNotes);
        break;
      }
      case NoteTypeENUM.Private: {
        notes = this.store.selectSnapshot(NoteStore.privateNotes);
        break;
      }
      case NoteTypeENUM.Shared: {
        notes = this.store.selectSnapshot(NoteStore.sharedNotes);
        break;
      }
      case NoteTypeENUM.Archive: {
        notes = this.store.selectSnapshot(NoteStore.archiveNotes);
        break;
      }
      default: {
        throw new Error('error');
      }
    }
    this.notesLink = notes.filter((z) => z.id !== this.id);
  }

  async ngOnDestroy() {
    this.updateNoteService.notesIds$.next([
      ...this.updateNoteService.notesIds$.getValue(),
      this.id,
    ]);
    await this.signalRService.leaveNote(this.id);
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNote());
    this.routeSubscription.unsubscribe();
  }
}
