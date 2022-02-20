import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { HtmlTitleService } from 'src/app/core/html-title.service';
import { AudioService } from '../notes/audio.service';
import { DeltaConverter } from '../notes/full-note/content-editor/converter/delta-converter';
import { LoadPersonalization, LoadUsedDiskSpace } from '../../core/stateUser/user-action';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit, OnDestroy {
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

    this.store.dispatch([LoadUsedDiskSpace]);
    this.store.dispatch(LoadPersonalization);

    this.store
      .select(AppStore.isProfile)
      .pipe(takeUntil(this.destroy))
      .subscribe((z) => {
        setTimeout(() => {
          this.newProfile = z;
        });
      });
  }
}
