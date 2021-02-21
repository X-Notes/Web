import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { Store } from '@ngxs/store';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { takeUntil } from 'rxjs/operators';
import { LoadFontSizes, LoadLanguages, LoadThemes } from 'src/app/core/stateApp/app-action';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  newButtonActive = false;
  newProfile = false;

  constructor(public pService: PersonalizationService,
              private store: Store) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit() {
    this.store.dispatch([LoadLanguages, LoadThemes, LoadFontSizes]);
    this.store.select(AppStore.getNewButtonActive)
      .pipe(takeUntil(this.destroy))
      .subscribe(z => {
        setTimeout(() => this.newButtonActive = z);
      });

    this.store.select(AppStore.isProfile)
      .pipe(takeUntil(this.destroy))
      .subscribe(z => {
        setTimeout(() => this.newProfile = z);
      });
  }
}
