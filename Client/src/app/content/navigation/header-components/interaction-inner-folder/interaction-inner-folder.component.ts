import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { DialogsManageService } from '../../dialogs-manage.service';

@Component({
  selector: 'app-interaction-inner-folder',
  templateUrl: './interaction-inner-folder.component.html',
  styleUrls: ['./interaction-inner-folder.component.scss'],
})
export class InteractionInnerFolderComponent implements OnInit, OnDestroy {
  @Select(FolderStore.activeMenu)
  public menuActiveFolders$: Observable<boolean>;

  @Select(NoteStore.activeMenu)
  public menuActiveNotes$: Observable<boolean>;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  public countSelected: number;

  destroy = new Subject<void>();

  constructor(
    private store: Store,
    private dialogsService: DialogsManageService,
    private pService: PersonalizationService,
  ) {}

  ngOnInit(): void {}

  manageNotesInFolderHandler() {
    this.pService.manageNotesInFolderSubject.next(true);
  }

  selectAll() {}

  settingsClick() {}

  newButton() {}

  unselectAll() {}

  initCountSelected() {
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

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
