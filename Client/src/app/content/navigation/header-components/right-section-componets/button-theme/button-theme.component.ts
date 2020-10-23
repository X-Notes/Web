import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { ChangeTheme } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-button-theme',
  templateUrl: './button-theme.component.html',
  styleUrls: ['./button-theme.component.scss']
})
export class ButtonThemeComponent implements OnInit {


  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor(private store: Store, ) { }

  ngOnInit(): void {
  }

  toggleTheme() {
    this.store.dispatch(new ChangeTheme());
  }

}
