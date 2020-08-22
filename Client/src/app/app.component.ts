import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PersonalizationService } from './shared/services/personalization.service';
import { SignalRService } from './core/signal-r.service';
import { Store } from '@ngxs/store';
import { UserStore } from './core/stateUser/user-state';
import { Language } from './shared/enums/Language';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private translateService: TranslateService, private store: Store) {
    const lang  = this.store.selectSnapshot(UserStore.getUserLanguage);
    this.translateService.use(lang);
  }
}
