import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription, of } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LoadLabels } from '../../labels/state/labels-actions';
import { FullNote } from '../../notes/models/full-note.model';
import { SmallNote } from '../../notes/models/small-note.model';
import { LoadFullNote } from '../../notes/state/notes-actions';
import { NoteStore } from '../../notes/state/notes-state';
import { ApiFullFolderService } from '../full-folder/services/api-full-folder.service';
import { ApiNoteEditorService } from 'src/app/editor/api/api-editor-content.service';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { LoadFullFolder } from '../state/folders-actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LabelStore } from '../../labels/state/labels-state';
import { Label } from '../../labels/models/label.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-full-folder-note',
  templateUrl: './full-folder-note.component.html',
  styleUrls: ['./full-folder-note.component.scss'],
})
export class FullFolderNoteComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(NoteStore.canEdit)
  public canEdit$: Observable<boolean>;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  theme$: Observable<ThemeENUM>;

  @Select(UserStore.getUser)
  user$: Observable<ShortUser>;

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.fullNoteTitle)
  noteTitle$: Observable<string>;

  @Select(LabelStore.noDeleted)
  public labels$: Observable<Label[]>;

  destroy = new Subject<void>();

  linkNotes: SmallNote[] = [];

  loaded = false;

  notesLoaded = false;

  contents: ContentModelBase[];

  folderId: string;

  noteId: string;

  private routeSubscription: Subscription;

  constructor(
    route: ActivatedRoute,
    private store: Store,
    private apiFullFolder: ApiFullFolderService,
    private api: ApiNoteEditorService,
    public pService: PersonalizationService,
  ) {
    this.routeSubscription = route.params.pipe(takeUntilDestroyed()).subscribe(async (params) => {
      this.noteId = params.noteId;
      this.folderId = params.folderId;
      this.loaded = false;
      this.notesLoaded = false;
      this.linkNotes = [];
      if (!this.folderId) return;
      await this.store.dispatch(new LoadFullFolder(this.folderId)).toPromise();
      await this.loadMainContent();
    });
  }

  async loadMainContent() {
    await this.initNote();
    this.store.dispatch(new LoadLabels());
    this.destroy.next();
    this.destroy.complete();
  }

  async initNote() {
    await this.loadMain();
    // LEFT SECTION
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    const notes = await this.apiFullFolder.getFolderNotes(this.folderId, pr.contentInNoteCount).toPromise();
    this.linkNotes = notes?.length > 0 ? notes.filter(x => x.id !== this.noteId) : [];
    this.notesLoaded = true;
  }

  async loadMain() {
    await this.store.dispatch(new LoadFullNote(this.noteId, this.folderId)).toPromise();
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    if (note) {
      await this.loadContent();
    }
    this.loaded = true;
  }

  async loadContent() {
    this.contents = await this.api.getContents(this.noteId, this.folderId).toPromise();
  }

  getLabels(labelIds: string[]): Observable<Label[]> {
    if (!labelIds) return of([]);
    return this.labels$.pipe(map(labels => {
      return labels.filter(label => labelIds.some(f => f === label.id));
    }));
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {}
}
