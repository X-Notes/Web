import { Component, OnInit, OnDestroy } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Theme } from 'src/app/shared/models/Theme';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { MenuButtonsService } from '../menu-buttons.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnDestroy {
  @Select(AppStore.isNoteInner)
  public isNoteInner$: Observable<boolean>;

  constructor(public pService: PersonalizationService, public buttonService: MenuButtonsService) {}

  ngOnDestroy(): void {}

  ngOnInit(): void {
    console.log('init');
  }

  disableTooltpUser(): boolean {
    if (!this.pService.check()) {
      return true;
    }
  }
}
