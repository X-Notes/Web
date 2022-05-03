import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FullFolder } from 'src/app/content/folders/models/full-folder.model';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import {
  PersonalizationService,
  showMenuLeftRight,
} from 'src/app/shared/services/personalization.service';
import { MenuButtonsService } from '../../services/menu-buttons.service';
import { PermissionsButtonsService } from '../../services/permissions-buttons.service';

@Component({
  selector: 'app-interaction-inner-folder',
  templateUrl: './interaction-inner-folder.component.html',
  styleUrls: ['./interaction-inner-folder.component.scss'],
  animations: [showMenuLeftRight],
})
export class InteractionInnerFolderComponent implements OnInit, OnDestroy {
  @Select(FolderStore.canView)
  canView$: Observable<boolean>;

  @Select(FolderStore.isOwner)
  isOwner$: Observable<boolean>;

  @Select(FolderStore.full)
  folder$: Observable<FullFolder>;

  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(NoteStore.activeMenu)
  public isSelectedNotes$: Observable<boolean>;

  public countSelected: number;

  destroy = new Subject<void>();

  constructor(
    private store: Store,
    public pService: PersonalizationService,
    public menuButtonService: MenuButtonsService,
    public pB: PermissionsButtonsService,
  ) {}

  ngOnInit(): void {
    this.initCountSelected();
  }

  addNotesToFolderHandler() {
    this.pService.addNotesToFolderSubject.next(true);
  }

  selectAll() {
    this.pService.selectAllButton.next(true);
  }

  newButton() {
    this.pService.newButtonSubject.next(true);
  }

  unselectAll() {
    this.store.dispatch(new UnSelectAllNote());
  }

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
