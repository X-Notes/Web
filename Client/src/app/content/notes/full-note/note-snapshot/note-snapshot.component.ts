import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { UpdateRoute } from 'src/app/core/stateApp/app-action';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';
import {
  PersonalizationService,
  sideBarCloseOpen,
} from 'src/app/shared/services/personalization.service';
import { ApiServiceNotes } from '../../api-notes.service';
import { ContentModel } from '../../models/content-model.model';
import { LoadSnapshotNote } from '../../state/notes-actions';
import { NoteStore } from '../../state/notes-state';
import { NoteSnapshotState } from '../models/history/note-snapshot-state.model';

@Component({
  selector: 'app-note-snapshot',
  templateUrl: './note-snapshot.component.html',
  styleUrls: ['./note-snapshot.component.scss'],
  animations: [sideBarCloseOpen],
})
export class NoteSnapshotComponent implements OnInit, OnDestroy {
  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  @Select(NoteStore.snapshotState)
  public snapshotState$: Observable<NoteSnapshotState>;

  private routeSubscription: Subscription;

  private noteId: string;

  private snapshotId: string;

  destroy = new Subject<void>();

  contents: ContentModel[];

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private route: ActivatedRoute,
    private api: ApiServiceNotes,
  ) {
    this.routeSubscription = route.params.subscribe((params) => {
      this.noteId = params['id'];
      this.snapshotId = params['snapshotId'];
    });

    this.store
      .select(AppStore.appLoaded)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (x: boolean) => {
        if (x) {
          this.store.dispatch(new LoadSnapshotNote(this.snapshotId, this.noteId));
          this.contents = await this.api.getContents(this.snapshotId).toPromise();
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.store.dispatch(new UpdateRoute(EntityType.History));
  }
}
