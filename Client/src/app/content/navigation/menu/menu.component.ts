import { Component } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MenuButtonsService } from '../menu-buttons.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {
  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  constructor(public pService: PersonalizationService, public buttonService: MenuButtonsService) {}

  // eslint-disable-next-line consistent-return
  disableTooltpUser = () => {
    if (!this.pService.check()) {
      return true;
    }
  };
}
