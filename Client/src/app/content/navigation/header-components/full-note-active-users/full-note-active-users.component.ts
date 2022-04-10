import { Component, ElementRef, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  PersonalizationService,
  showMenuLeftRight,
} from '../../../../shared/services/personalization.service';
import { OnlineUsersNote } from '../../../notes/models/online-users-note.model';
import { NoteStore } from '../../../notes/state/notes-state';

@Component({
  selector: 'app-full-note-active-users',
  templateUrl: './full-note-active-users.component.html',
  styleUrls: ['./full-note-active-users.component.scss'],
  animations: [showMenuLeftRight],
})
export class FullNoteActiveUsersComponent {
  @ViewChild('heightPeople') heightPeople: ElementRef;

  @ViewChild('scrollbar') scrollbar: ElementRef;

  @Select(NoteStore.getOnlineUsersOnNote)
  onlineUsers$: Observable<OnlineUsersNote[]>;

  constructor(public pService: PersonalizationService) {}

  showUsers() {
    this.pService.users = !this.pService.users;
  }

  disableTooltpUser(): boolean {
    if (this.pService.checkWidth()) {
      return true;
    }
    return false;
  }

  closeMenu(): void {
    if (this.pService.checkWidth()) {
      this.pService.users = false;
    }

    if (!this.pService.check()) {
      this.pService.hideInnerMenu = false;
    }
  }
}
