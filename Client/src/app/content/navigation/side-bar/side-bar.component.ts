import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  theme = Theme;

  constructor() { }

  ngOnInit(): void {
  }

}
