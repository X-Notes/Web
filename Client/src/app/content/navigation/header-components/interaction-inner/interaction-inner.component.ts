import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { FullNote } from 'src/app/content/notes/models/fullNote';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
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

  @Select(NoteStore.oneFull)
  note$: Observable<FullNote>;

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
