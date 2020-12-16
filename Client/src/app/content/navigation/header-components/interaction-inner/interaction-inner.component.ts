import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Select } from '@ngxs/store';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, showMenuLeftRight } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-inner',
  templateUrl: './interaction-inner.component.html',
  styleUrls: ['./interaction-inner.component.scss'],
  animations: [ showMenuLeftRight ],
})
export class InteractionInnerComponent implements OnInit {

  user: string[] = ['fucking person', 'fucking person', 'fucking person', 'fucking person', 'fucking person'
  ];

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  closeMenu(): void {
    if (this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if (!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }

  hideMenu() {
    this.pService.hideInnerMenu = !this.pService.hideInnerMenu;
  }

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
  }

}
