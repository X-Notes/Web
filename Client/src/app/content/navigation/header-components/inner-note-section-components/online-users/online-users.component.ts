import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-online-users',
  templateUrl: './online-users.component.html',
  styleUrls: ['./online-users.component.scss']
})
export class OnlineUsersComponent implements OnInit {

  user: string[] = ['good person', 'good person', 'good person', 'good person', 'good person', 'good person', 'good person', 'good person'];

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
  }

}
