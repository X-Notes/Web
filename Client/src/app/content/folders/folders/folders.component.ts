import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Folder } from '../models/folder';
import { FolderStore } from '../state/folders-state';
import { Select, Store } from '@ngxs/store';
import { LoadAllFolders } from '../state/folders-actions';


@Component({
  selector: 'app-folders',
  templateUrl: './folders.component.html',
  styleUrls: ['./folders.component.scss'],
  animations: [ sideBarCloseOpen ]
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


  destroy = new Subject<void>();

  theme = Theme;

  constructor(public pService: PersonalizationService, private store: Store) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  async ngOnInit() {
    await this.store.dispatch(new LoadAllFolders()).toPromise();

    this.pService.onResize();
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newFolder());
  }

  newFolder() {
    console.log('folder');
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
