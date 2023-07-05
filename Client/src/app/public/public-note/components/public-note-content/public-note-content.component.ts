import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NoteStore } from '../../../../content/notes/state/notes-state';
import { Observable, Subject, Subscription } from 'rxjs';
import { FullNote } from '../../../../content/notes/models/full-note.model';
import { ActivatedRoute } from '@angular/router';
import { DeleteCurrentNoteData, LoadFullNote } from '../../../../content/notes/state/notes-actions';
import { PersonalizationService } from '../../../../shared/services/personalization.service';
import { GetPublicUser } from '../../../storage/public-action';
import { PublicStore } from '../../../storage/public-state';
import { ShortUserPublic } from '../../../interfaces/short-user-public.model';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { take, takeUntil } from 'rxjs/operators';
import { ApiNoteContentService } from 'src/app/editor/api/api-editor-content.service';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/user/short-user.model';
import { AuthService } from 'src/app/core/auth.service';

@Component({
  selector: 'app-public-note-content',
  templateUrl: './public-note-content.component.html',
  styleUrls: ['./public-note-content.component.scss'],
})
export class PublicNoteContentComponent implements OnInit, OnDestroy {
  @Select(NoteStore.oneFull)
  note$?: Observable<FullNote>;

  @Select(PublicStore.owner)
  owner$?: Observable<ShortUserPublic>;

  @Select(NoteStore.fullNoteTitle)
  noteTitle$?: Observable<string>;

  @Select(UserStore.getUser)
  user$: Observable<ShortUser>;
  
  @Select(NoteStore.canView)
  public canView$?: Observable<boolean>;

  destroy = new Subject<void>();

  loaded = false;

  contents?: ContentModelBase[];

  theme = ThemeENUM;

  folderId: string;

  noteId: string;

  private routeSubscription: Subscription;

  get redirectUrl(): string {
    return this.folderId ? `folders/${this.folderId}/${this.noteId}` : `notes/${this.noteId}`;
  }

  constructor(
    private readonly route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    private apiNotes: ApiNoteContentService,
    public authService: AuthService,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      this.noteId = params.id;
      await this.loadMain(this.noteId);
    });
  }

  ngOnInit(): void {
    this.store.select(NoteStore.fullNoteState).pipe(takeUntil(this.destroy)).subscribe((state) => {
      if (state?.isCanView) {
        this.authService.redirectOnSuccessAuth(this.redirectUrl);
      }
    });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNoteData());
    this.routeSubscription.unsubscribe();
  }

  async loadMain(noteId: string) {
    const maybeFolderId = await this.tryGetFolderId();
    this.folderId = typeof maybeFolderId === 'string' ? maybeFolderId : null;
    await this.store.dispatch(new LoadFullNote(noteId, this.folderId)).toPromise();
    const isLocked = this.store.selectSnapshot(NoteStore.isLocked);
    if (!isLocked) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      if (note) {
        const ownerId = this.store.selectSnapshot(NoteStore.getOwnerId);
        await this.store.dispatch(new GetPublicUser(ownerId)).toPromise();
        this.contents = await this.apiNotes.getContents(noteId, this.folderId).toPromise();
      }
    }
    this.loaded = true;
  }

  private tryGetFolderId() {
    return new Promise<string>((resolve) => {
      this.route.queryParams.pipe(take(1)).subscribe((v) => {
        resolve(v.folderId);
      });
    });
  }
}
