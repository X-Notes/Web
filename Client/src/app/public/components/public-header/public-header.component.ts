import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { NoteStore } from '../../../content/notes/state/notes-state';
import { Observable } from 'rxjs';
import { AuthService, AuthStatus } from 'src/app/core/auth.service';
import { OnlineUsersNote } from '../../../content/notes/models/online-users-note.model';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss'],
})
export class PublicHeaderComponent implements OnInit, OnDestroy {
  @Input()
  isEditingMessage: boolean | null = false;

  @Select(NoteStore.getOnlineUsersOnNote)
  onlineUsers$?: Observable<OnlineUsersNote[]>;

  constructor(public authService: AuthService) {}

  get loginMessage(): string {
    if (this.isEditingMessage) {
      return 'header.signInEditing';
    }
    return 'header.signIn';
  }

  ngOnDestroy(): void {}

  ngOnInit(): void {}

  login(): void {
    if (this.authService.authStatus.value === AuthStatus.InProgress) return;
    this.authService.authGoogle();
  }
}
