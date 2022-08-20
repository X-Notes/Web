import { Component, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import { NoteStore } from '../../../content/notes/state/notes-state';
import { Observable } from 'rxjs';
import { OnlineUsersNote } from '../../../content/notes/models/online-users-note.model';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.scss'],
})
export class PublicHeaderComponent implements OnInit {
  @Select(NoteStore.getOnlineUsersOnNote)
  onlineUsers$: Observable<OnlineUsersNote[]>;

  ngOnInit(): void {
    this.onlineUsers$.subscribe((user) => {
      console.log(user);
    });
  }
}
