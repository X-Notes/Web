import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {

  constructor(private translateService: TranslateService, private store: Store) {
  }

  async ngOnInit() {
    const lang  = this.store.selectSnapshot(UserStore.getUserLanguage);
    await this.translateService.use(lang).toPromise();
  }

}
