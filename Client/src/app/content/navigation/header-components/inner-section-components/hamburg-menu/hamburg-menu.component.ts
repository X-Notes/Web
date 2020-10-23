import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-hamburg-menu',
  templateUrl: './hamburg-menu.component.html',
  styleUrls: ['./hamburg-menu.component.scss']
})
export class HamburgMenuComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;
  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.pService.stateSidebar = !this.pService.stateSidebar;
  }

}
