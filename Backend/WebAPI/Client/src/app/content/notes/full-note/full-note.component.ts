import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { DeleteCurrentNoteData, LoadFullNote, LoadNotes } from '../state/notes-actions';
import { NoteStore } from '../state/notes-state';
import { FullNote } from '../models/full-note.model';
import { SmallNote } from '../models/small-note.model';
import { LoadLabels } from '../../labels/state/labels-actions';
import { UpdaterEntitiesService } from '../../../core/entities-updater.service';
import { DialogsManageService } from '../../navigation/services/dialogs-manage.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ApiNoteEditorService } from 'src/app/editor/api/api-editor-content.service';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { ShortUser } from 'src/app/core/models/user/short-user.model';

@Component({
  selector: 'app-full-note',
  templateUrl: './full-note.component.html',
  styleUrls: ['./full-note.component.scss'],
})
export class FullNoteComponent implements OnInit, OnDestroy {
  @ViewChild('uploadPhotos') uploadPhoto: ElementRef;

  @Select(NoteStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(UserStore.getUser)
  user$: Observable<ShortUser>;
  
  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.fullNoteTitle)
  noteTitle$: Observable<string>;

  public notesLink: SmallNote[];

  loaded = false;

  notesLoaded = false;

  destroy = new Subject<void>();

  contents: ContentModelBase[];

  id: string;

  private routeSubscription: Subscription;

  constructor(
    route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    private api: ApiNoteEditorService,
    private updateNoteService: UpdaterEntitiesService,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      this.id = params.id;
      await this.loadMain();
      this.store.dispatch(new LoadLabels());
      this.destroy.next();
      this.destroy.complete();
    });
  }

  ngOnInit() {
  }

  async loadContent() {
    this.contents = await this.api.getContents(this.id).toPromise();
  }

  async loadMain() {
    await this.store.dispatch(new LoadFullNote(this.id)).toPromise();
    await this.loadInternalContent();
    this.loaded = true;
    this.loadLeftMenuWithNotes();
  }

  async loadInternalContent() {
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    if (note) {
      await this.loadContent();
    }
  }

  async loadLeftMenuWithNotes() {
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const types = Object.values(NoteTypeENUM).filter((q) => typeof q === 'number');
    const actions = types.map((t: NoteTypeENUM) => new LoadNotes(t, pr));

    await this.store.dispatch(actions).toPromise();
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    if (note?.noteTypeId) {
      await this.setSideBarNotes(note.noteTypeId);
    }
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
    this.notesLink = notes.filter((q) => q.id !== this.id);
    this.notesLoaded = true;
  }

  ngOnDestroy() {
    this.updateNoteService.addNoteToUpdate(this.id);
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNoteData());
    this.routeSubscription.unsubscribe();
  }
}
