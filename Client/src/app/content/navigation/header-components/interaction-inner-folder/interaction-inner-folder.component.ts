import { Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FolderStore } from 'src/app/content/folders/state/folders-state';
import { UnSelectAllNote } from 'src/app/content/notes/state/notes-actions';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-inner-folder',
  templateUrl: './interaction-inner-folder.component.html',
  styleUrls: ['./interaction-inner-folder.component.scss'],
})
export class InteractionInnerFolderComponent implements OnInit, OnDestroy {
  @Select(AppStore.getName)
  public route$: Observable<string>;

  public countSelected: number;

  destroy = new Subject<void>();

  constructor(private store: Store, public pService: PersonalizationService) {}

  ngOnInit(): void {
    this.initCountSelected();
  }

  manageNotesInFolderHandler() {
    this.pService.manageNotesInFolderSubject.next(true);
  }

  selectAll() {
    this.pService.selectAllButton.next(true);
  }

  settingsClick() {}

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
          console.log(this.countSelected);
        }
      });

    this.store
      .select(FolderStore.selectedCount)
      .pipe(takeUntil(this.destroy))
      .subscribe((x) => {
        if (x > 0) {
          this.countSelected = x;
          console.log(this.countSelected);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
