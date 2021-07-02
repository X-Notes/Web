import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { Store, Select } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SelectAllNote, UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { SelectAllFolder, UnSelectAllFolder } from 'src/app/content/folders/state/folders-actions';
import { map, takeUntil, withLatestFrom } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { MatMenu } from '@angular/material/menu';
import { hideForDemo } from 'src/environments/demo';

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

  @ViewChild(MatMenu) menu: MatMenu;

  public countSelected: number;

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
}
