import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PersonalizationService } from './shared/services/personalization.service';
import { SignalRService } from './core/signal-r.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private translateService: TranslateService, private pService: PersonalizationService) {
    this.translateService.use(pService.language);
  }
}
