import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SelectAllNote, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { SelectAllFolder, UnSelectAllFolder } from 'src/app/content/folders/state/folders-actions';
import { takeUntil } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';

@Component({
  selector: 'app-interaction-items',
  templateUrl: './interaction-items.component.html',
  styleUrls: ['./interaction-items.component.scss']
})
export class InteractionItemsComponent implements OnInit {

  public countSelected: number;

  destroy = new Subject<void>();

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  theme = Theme;

  constructor(private store: Store) { }

  ngOnInit(): void {
    this.store.select(NoteStore.selectedCount)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => {
      if (x > 0) {
        this.countSelected = x;
      }
    });

    this.store.select(FolderStore.selectedCount)
    .pipe(takeUntil(this.destroy))
    .subscribe(x => {
      if (x > 0) {
        this.countSelected = x;
      }
    });
  }

  // Modal Windows
  settingsClick() {
    console.log('settings');
  }

  // Selection

  selectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      const noteType = this.store.selectSnapshot(AppStore.getRouting);
      this.store.dispatch(new SelectAllNote(noteType));
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      const folderType = this.store.selectSnapshot(AppStore.getRouting);
      this.store.dispatch(new SelectAllFolder(folderType));
    }
  }

  unselectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      this.store.dispatch(new UnSelectAllNote());
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      this.store.dispatch(new UnSelectAllFolder());
    }
  }

}
