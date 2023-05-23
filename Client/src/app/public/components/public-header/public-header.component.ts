import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NoteStore, FullNoteState } from '../../../content/notes/state/notes-state';
import { Observable, Subject } from 'rxjs';
import { AuthService, AuthStatus } from 'src/app/core/auth.service';
import { takeUntil } from 'rxjs/operators';
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

  subscriptionOnLoadNote$?: Observable<FullNoteState>;

  destroy$ = new Subject<void>();

  constructor(public authService: AuthService, private store: Store) {}

  get loginMessage(): string {
    if (this.isEditingMessage) {
      return 'header.signInEditing';
    }
    return 'header.signIn';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.subscriptionOnLoadNote$ = this.store.select(NoteStore.fullNoteState);
    this.subscriptionOnLoadNote$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state?.isCanView) {
        this.authService.redirectOnSuccessAuth(`notes/${state.note.id}`);
      }
    });
  }

  login(): void {
    if (this.authService.authStatus.value === AuthStatus.InProgress) return;
    this.authService.authGoogle();
  }
}
