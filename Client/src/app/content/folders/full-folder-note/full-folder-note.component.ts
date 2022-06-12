import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LoadLabels } from '../../labels/state/labels-actions';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { ContentModelBase } from '../../notes/models/editor-models/content-model-base';
import { FullNote } from '../../notes/models/full-note.model';
import { SmallNote } from '../../notes/models/small-note.model';
import { LoadFullNote } from '../../notes/state/notes-actions';
import { NoteStore } from '../../notes/state/notes-state';
import { ApiFullFolderService } from '../full-folder/services/api-full-folder.service';

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

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(NoteStore.fullNoteTitle)
  noteTitle$: Observable<string>;

  destroy = new Subject<void>();

  linkNotes: SmallNote[] = [];

  loaded = false;

  contents: ContentModelBase[];

  private folderId: string;

  private noteId: string;

  private routeSubscription: Subscription;

  constructor(
    route: ActivatedRoute,
    private store: Store,
    private apiFullFolder: ApiFullFolderService,
    private api: ApiServiceNotes,
    public pService: PersonalizationService,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      this.noteId = params.noteId;
      this.folderId = params.folderId;
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
    this.linkNotes = await this.apiFullFolder.getFolderNotes(this.folderId, pr).toPromise();
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
    this.contents = await this.api.getContents(this.noteId).toPromise();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {
    this.store.dispatch(new UpdateRoute(EntityType.FolderInnerNote));
  }
}
