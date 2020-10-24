import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SetDefaultBackground } from 'src/app/core/stateUser/user-action';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';

@Component({
  selector: 'app-button-default-background',
  templateUrl: './button-default-background.component.html',
  styleUrls: ['./button-default-background.component.scss']
})
export class ButtonDefaultBackgroundComponent implements OnInit {

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
