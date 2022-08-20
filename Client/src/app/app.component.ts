import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserStore } from './core/stateUser/user-state';
import { LanguagesENUM } from './shared/enums/languages.enum';
import { IconsService } from './shared/services/icons.service';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  destroy = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private store: Store,
    private iconsService: IconsService,
  ) {}

  ngOnInit() {
    this.registerDayJsPlugins();
    this.iconsService.registerIcons();
    this.store
      .select(UserStore.getUserLanguage)
      .pipe(takeUntil(this.destroy))
      .subscribe(async (language) => {
        const langIsoName = LanguagesENUM[language ?? LanguagesENUM.en];
        require(`dayjs/locale/${langIsoName}`);
        dayjs.locale(LanguagesENUM[language]);
        await this.translateService.use(langIsoName).toPromise();
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  private registerDayJsPlugins() {
    dayjs.extend(relativeTime);
    dayjs.extend(localizedFormat);
  }
}
