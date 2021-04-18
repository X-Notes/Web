import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  PersonalizationService,
  sideBarCloseOpen,
} from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ShortUser } from 'src/app/core/models/short-user';
import { AddFolder } from '../state/folders-actions';
import { FolderStore } from '../state/folders-state';

@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
  animations: [sideBarCloseOpen],
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
  public userBackground$: Observable<ShortUser>;

  destroy = new Subject<void>();

  public photoError = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    private router: Router,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    this.pService.onResize();
    this.pService.newButtonSubject.pipe(takeUntil(this.destroy)).subscribe(() => this.newFolder());
  }

  async newFolder() {
    await this.store.dispatch(new AddFolder()).toPromise();
    this.store
      .select(FolderStore.privateFolders)
      .pipe(take(1))
      .subscribe((x) => this.router.navigate([`folders/${x[0].id}`]));
  }

  changeSource() {
    this.photoError = true;
  }
}
