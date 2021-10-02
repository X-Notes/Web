import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { SignalRService } from 'src/app/core/signal-r.service';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { LoadLabels } from '../../labels/state/labels-actions';
import { ApiServiceNotes } from '../../notes/api-notes.service';
import { FullNoteSliderService } from '../../notes/full-note/services/full-note-slider.service';
import { ContentModel } from '../../notes/models/content-model.model';
import { FullNote } from '../../notes/models/full-note.model';
import { SmallNote } from '../../notes/models/small-note.model';
import { LoadFullNote, LoadOnlineUsersOnNote } from '../../notes/state/notes-actions';
import { NoteStore } from '../../notes/state/notes-state';
import { ApiFullFolderService } from '../full-folder/services/api-full-folder.service';

@Component({
  selector: 'app-full-folder-note',
  templateUrl: './full-folder-note.component.html',
  styleUrls: ['./full-folder-note.component.scss'],
  providers: [FullNoteSliderService],
})
export class FullFolderNoteComponent implements OnInit, OnDestroy {

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(NoteStore.canView)
  public canView$: Observable<boolean>;

  @Select(NoteStore.canNoView)
  public canNoView$: Observable<boolean>;

  @ViewChild('fullWrap') wrap: ElementRef;

  destroy = new Subject<void>();

  linkNotes: SmallNote[] = [];

  loaded = false;

  note: FullNote;

  contents: ContentModel[];

  private folderId: string;

  private noteId: string;

  private routeSubscription: Subscription;

  constructor(
    route: ActivatedRoute,
    private store: Store,
    private apiFullFolder: ApiFullFolderService,
    public sliderService: FullNoteSliderService,
    private signalRService: SignalRService,
    private api: ApiServiceNotes,
    public pService: PersonalizationService,
  ) {
    this.routeSubscription = route.params.subscribe((params) => {
      this.noteId = params.noteId;
      this.folderId = params.folderId;

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
    // LEFT SECTION
    const pr = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    this.linkNotes = await this.apiFullFolder.getFolderNotes(this.folderId, pr).toPromise();
    await this.store.dispatch(new LoadFullNote(this.noteId)).toPromise();

    await this.signalRService.joinNote(this.noteId);
    this.store.dispatch(new LoadOnlineUsersOnNote(this.noteId));
    this.signalRService.updateContentEvent
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.loadContent());
  }

  async loadMain() {
    await this.store.dispatch(new LoadFullNote(this.noteId)).toPromise();
    await this.loadContent();
    this.note = this.store.selectSnapshot(NoteStore.oneFull);
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

  panMove(e) {
    this.sliderService.panMove(e, this.wrap);
  }

  panEnd(e) {
    this.sliderService.panEnd(e, this.wrap);
  }
}
