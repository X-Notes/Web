import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user.model';
import { CreateFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
})
export class FoldersComponent implements OnInit, OnDestroy {
  @Select(FolderStore.privateCount)
  public countPrivate: Observable<number>;

  @Select(FolderStore.sharedCount)
  public countShared: Observable<number>;

  @Select(FolderStore.deletedCount)
  public countDeleted: Observable<number>;

  @Select(FolderStore.archiveCount)
  public countArchive: Observable<number>;

  @Select(UserStore.getUser)
  public user$: Observable<ShortUser>;

  @Select(UserStore.getUserBackground)
  public userBackground$: Observable<string>;

  destroy = new Subject<void>();

  constructor(public pService: PersonalizationService, private store: Store) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {
    this.pService.newButtonSubject
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.store.dispatch(new CreateFolder()));
  }
}
