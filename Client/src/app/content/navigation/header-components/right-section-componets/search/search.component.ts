import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AppStore } from 'src/app/core/stateApp/app-state';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  @Select(AppStore.getMenuActive)
  public menuActive$: Observable<boolean>;

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor() { }

  ngOnInit(): void {
  }

}
