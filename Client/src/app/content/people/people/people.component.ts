import { Component, OnInit, OnDestroy } from '@angular/core';
import { Theme } from 'src/app/shared/enums/Theme';
import { PersonalizationService, sideBarCloseOpen } from 'src/app/shared/services/personalization.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export enum subMenu {
  All = 'all',
  Invitations = 'invitations'
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  animations: [ sideBarCloseOpen ]
})
export class PeopleComponent implements OnInit, OnDestroy {

  destroy = new Subject<void>();
  current: subMenu;
  menu = subMenu;
  theme = Theme;

  constructor(public pService: PersonalizationService) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }

  ngOnInit(): void {
    this.current = subMenu.All;
    this.pService.subject
    .pipe(takeUntil(this.destroy))
    .subscribe(x => this.newPeople());
  }

  newPeople() {
    console.log('new people');
  }

  switchSub(value: subMenu) {
    this.current = value;
  }

  cancelSideBar() {
    this.pService.stateSidebar = false;
  }

}
