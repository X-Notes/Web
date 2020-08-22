import { Component, OnInit } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class ProfileComponent implements OnInit {

  @Select(UserStore.getUserTheme)
  public theme$: Observable<Theme>;

  check = true;
  theme = Theme;
  items: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 , 12, 13];

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
    this.pService.onResize();
  }

  toggle() {
    this.check = !this.check;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
