import { Component, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { SetDefaultBackground } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-interaction-profile',
  templateUrl: './interaction-profile.component.html',
  styleUrls: ['./interaction-profile.component.scss']
})
export class InteractionProfileComponent implements OnInit {

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor(private store: Store) { }

  ngOnInit(): void {
  }

  setDefaultColorProfile() {
    this.store.dispatch(new SetDefaultBackground());
  }

}
