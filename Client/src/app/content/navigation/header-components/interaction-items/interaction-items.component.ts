import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SelectAllNote, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { SelectAllFolder, UnSelectAllFolder } from 'src/app/content/folders/state/folders-actions';
import { takeUntil } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-items',
  templateUrl: './interaction-items.component.html',
  styleUrls: ['./interaction-items.component.scss'],
})
export class InteractionItemsComponent implements OnInit {
  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  public countSelected: number;

  destroy = new Subject<void>();

  constructor(private store: Store, public pService: PersonalizationService) {}

  ngOnInit(): void {
    this.store
      .select(NoteStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (x > 0) {
          this.countSelected = x;
        }
      });

    this.store
      .select(FolderStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (x > 0) {
          this.countSelected = x;
        }
      });
  }

  // Modal Windows
  settingsClick = () => {
    console.log('settings');
  };

  // Selection

  selectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      const type = this.store
        .selectSnapshot(AppStore.getNoteTypes)
        .find((x) => x.name === noteType);
      this.store.dispatch(new SelectAllNote(type));
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
      const type = this.store
        .selectSnapshot(AppStore.getFolderTypes)
        .find((x) => x.name === folderType);
      this.store.dispatch(new SelectAllFolder(type));
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

  newButton() {
    this.pService.subject.next(true);
  }
}
