import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PersonalizationService } from './shared/services/personalization.service';
import { SignalRService } from './core/signal-r.service';
import { Store } from '@ngxs/store';
import { UserStore } from './core/stateUser/user-state';
import { Language } from './shared/enums/Language';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();

  constructor(private translateService: TranslateService, private store: Store) {
  }

  ngOnInit() {
    this.store
      .select(UserStore.getUserLanguage)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (lang) => {
        if (lang) {
          await this.translateService.use(lang).toPromise();
        } else {
          await this.translateService.use(Language.EN).toPromise();
        }
      });
  }


  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

}
