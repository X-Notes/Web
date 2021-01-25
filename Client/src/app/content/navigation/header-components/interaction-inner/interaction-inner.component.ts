import { Component, OnInit } from '@angular/core';
import { PersonalizationService, showMenuLeftRight } from 'src/app/shared/services/personalization.service';

@Component({
  selector: 'app-interaction-inner',
  templateUrl: './interaction-inner.component.html',
  styleUrls: ['./interaction-inner.component.scss'],
  animations: [showMenuLeftRight],
})
export class InteractionInnerComponent implements OnInit {

  user: string[] = ['person', 'person', 'person', 'person', 'person', 'person', 'person', 'person', 'person', 'person'
  ];

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  closeMenu(): void {
    console.log(this.pService.checkWidth())
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
