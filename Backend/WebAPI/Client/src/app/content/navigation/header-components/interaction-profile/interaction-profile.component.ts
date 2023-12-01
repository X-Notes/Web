import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SetDefaultBackground } from 'src/app/core/stateUser/user-action';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { GeneralButtonStyleType } from '../general-header-button/models/general-button-style-type.enum';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  selector: 'app-interaction-profile',
  templateUrl: './interaction-profile.component.html',
  styleUrls: ['./interaction-profile.component.scss'],
})
export class InteractionProfileComponent {
  @Select(AppStore.getName)
  public route$: Observable<string>;

  @Select(AppStore.isProfile)
  public isProfile$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<ThemeENUM>;

  buttonStyleType = GeneralButtonStyleType;

  constructor(private store: Store, public pService: PersonalizationService) {}

  setDefaultColorProfile() {
    this.store.dispatch(new SetDefaultBackground());
  }

  newButton() {
    this.pService.newButtonSubject.next(true);
  }
}
