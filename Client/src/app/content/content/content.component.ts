import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Observable, Subject } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { AudioService } from '../notes/audio.service';
import { DeltaConverter } from '../notes/full-note/content-editor/converter/delta-converter';
import { LoadBillingPlans, LoadPersonalization, LoadUsedDiskSpace } from '../../core/stateUser/user-action';
import { EntityType } from 'src/app/shared/enums/entity-types.enum';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit, OnDestroy {
  @Select(AppStore.isDeletedFoldersNotesLabels)
  public isMesageActive$: Observable<boolean>;

  @Select(AppStore.getRouting)
  public routing$: Observable<EntityType>;

  destroy = new Subject<void>();

  newButtonActive = false;

  newProfile = false;

  constructor(
    public pService: PersonalizationService,
    private store: Store,
    public audioService: AudioService,
    private htmlTitleService: HtmlTitleService,
  ) {}

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {
    DeltaConverter.initQuill();
    this.htmlTitleService.init();

    this.store
      .select(AppStore.getNewButtonActive)
      .pipe(takeUntil(this.destroy))
      .subscribe((z) => {
        setTimeout(() => {
          this.newButtonActive = z;
        });
      });

    this.store.dispatch([LoadUsedDiskSpace, LoadBillingPlans, LoadPersonalization]);

    this.store
      .select(AppStore.isProfile)
      .pipe(takeUntil(this.destroy))
      .subscribe((z) => {
        setTimeout(() => {
          this.newProfile = z;
        });
      });
  }

  getMessage(type: EntityType): string {
    if (type === EntityType.FolderDeleted) {
      return 'delete-message.folders';
    }
    if (type === EntityType.NoteDeleted) {
      return 'delete-message.notes';
    }
    if (type === EntityType.LabelDeleted) {
      return 'delete-message.labels';
    }
    return null;
  }

  getDays(type: EntityType): number {
    if (type === EntityType.FolderDeleted) {
      return 30;
    }
    if (type === EntityType.NoteDeleted) {
      return 30;
    }
    if (type === EntityType.LabelDeleted) {
      return 30;
    }
    return null;
  }
}
