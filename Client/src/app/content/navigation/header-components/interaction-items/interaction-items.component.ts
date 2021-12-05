import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SelectAllNote, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { SelectAllFolder, UnSelectAllFolder } from 'src/app/content/folders/state/folders-actions';
import { takeUntil } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MatMenu } from '@angular/material/menu';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';
import { SortedByENUM } from 'src/app/core/models/sorted-by.enum';
import { UpdatePersonalization } from 'src/app/core/stateUser/user-action';

@Component({
  selector: 'app-interaction-items',
  templateUrl: './interaction-items.component.html',
  styleUrls: ['./interaction-items.component.scss'],
})
export class InteractionItemsComponent implements OnInit, OnDestroy {
  // TODO TWO SEPARATE COMPONENTS FOR NOTES AND FOLDERS
  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isActionFilterButton)
  public isActionFilterButton$: Observable<boolean>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(AppStore.isFolder)
  public isFolder$: Observable<boolean>;

  @Select(AppStore.isNote)
  public isNote$: Observable<boolean>;

  @Select(UserStore.getPersonalizationSettings)
  public personalizationSetting$: Observable<PersonalizationSetting>;

  @ViewChild(MatMenu) menu: MatMenu;

  public countSelected: number;

  sortedTypes = SortedByENUM;

  destroy = new Subject<void>();

  constructor(private store: Store, public pService: PersonalizationService) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

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

  get isAnyItemOnPage() {
    if (this.store.selectSnapshot(AppStore.isNote)) {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      return (
        this.store.selectSnapshot(NoteStore.getNotes).find((x) => x.typeNotes === noteType)?.count >
        0
      );
    }
    if (this.store.selectSnapshot(AppStore.isFolder)) {
      const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
      return (
        this.store.selectSnapshot(FolderStore.getFolders).find((x) => x.typeFolders === folderType)
          ?.count > 0
      );
    }
    return false;
  }

  // Selection

  selectAll() {
    let routePath = this.store.selectSnapshot(AppStore.isNote);
    if (routePath) {
      const noteType = this.store.selectSnapshot(AppStore.getTypeNote);
      this.store.dispatch(new SelectAllNote(noteType));
    }
    routePath = this.store.selectSnapshot(AppStore.isFolder);
    if (routePath) {
      const folderType = this.store.selectSnapshot(AppStore.getTypeFolder);
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

  newButton() {
    this.pService.newButtonSubject.next(true);
  }

  prMenuStyle(
    sortedType: SortedByENUM,
    prSettings: PersonalizationSetting,
    isFolder: boolean,
    isNote: boolean,
  ) {
    const effect = 'rgba(0,0,0,0.15)';
    if (isFolder) {
      return {
        background: sortedType === prSettings.sortedFolderByTypeId ? effect : null,
      };
    }
    if (isNote) {
      return {
        background: sortedType === prSettings.sortedNoteByTypeId ? effect : null,
      };
    }
  }

  updatePrMenuHandler(sortedType: SortedByENUM) {
    const prSettings = this.store.selectSnapshot(UserStore.getPersonalizationSettings);
    if (this.store.selectSnapshot(AppStore.isFolder)) {
      this.store.dispatch(
        new UpdatePersonalization({ ...prSettings, sortedFolderByTypeId: sortedType }),
      );
    }
    if (this.store.selectSnapshot(AppStore.isNote)) {
      this.store.dispatch(
        new UpdatePersonalization({ ...prSettings, sortedNoteByTypeId: sortedType }),
      );
    }
  }
}
