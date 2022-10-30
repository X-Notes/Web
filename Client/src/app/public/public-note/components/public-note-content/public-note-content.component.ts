import { Component, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NoteStore } from '../../../../content/notes/state/notes-state';
import { Observable, Subject, Subscription } from 'rxjs';
import { FullNote } from '../../../../content/notes/models/full-note.model';
import { ActivatedRoute } from '@angular/router';
import { DeleteCurrentNoteData, LoadFullNote } from '../../../../content/notes/state/notes-actions';
import { PersonalizationService } from '../../../../shared/services/personalization.service';
import { ContentModelBase } from '../../../../content/notes/models/editor-models/content-model-base';
import { ApiServiceNotes } from '../../../../content/notes/api-notes.service';
import { PublicUser } from '../../../storage/public-action';
import { PublicStore } from '../../../storage/public-state';
import { ShortUserPublic } from '../../../interfaces/short-user-public.model';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-public-note-content',
  templateUrl: './public-note-content.component.html',
  styleUrls: ['./public-note-content.component.scss'],
})
export class PublicNoteContentComponent implements OnDestroy {
  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

  @Select(PublicStore.owner)
  owner$: Observable<ShortUserPublic>;

  @Select(NoteStore.fullNoteTitle)
  noteTitle$: Observable<string>;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  destroy = new Subject<void>();

  loaded = false;

  contents: ContentModelBase[];

  theme = ThemeENUM;

  private routeSubscription: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private store: Store,
    public pService: PersonalizationService,
    private apiNotes: ApiServiceNotes,
  ) {
    this.routeSubscription = route.params.subscribe(async (params) => {
      await this.loadMain(params.id);
      this.destroy.next();
      this.destroy.complete();
    });
  }

  ngOnDestroy() {
    this.destroy.next();
    this.destroy.complete();
    this.store.dispatch(new DeleteCurrentNoteData());
    this.routeSubscription.unsubscribe();
  }

  async loadMain(id: string) {
    const maybeFolderId = await this.tryGetFolderId();
    const folderId = typeof maybeFolderId === 'string' ? maybeFolderId : null;
    await this.store.dispatch(new LoadFullNote(id, folderId)).toPromise();
    const isLocked = this.store.selectSnapshot(NoteStore.isLocked);
    if (!isLocked) {
      const note = this.store.selectSnapshot(NoteStore.oneFull);
      if (note) {
        const ownerId = this.store.selectSnapshot(NoteStore.getOwnerId);
        await this.store.dispatch(new PublicUser(ownerId)).toPromise();
        this.contents = await this.apiNotes.getContents(id, folderId).toPromise();
      }
    }
    this.loaded = true;
  }

  private tryGetFolderId() {
    return new Promise((resolve) => {
      this.route.queryParams.pipe(take(1)).subscribe((v) => {
        resolve(v.folderId);
      });
    });
  }
}
