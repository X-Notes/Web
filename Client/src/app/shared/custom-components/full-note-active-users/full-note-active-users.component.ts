import { Component, ElementRef, ViewChild } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { OnlineUsersNote } from '../../../content/notes/models/online-users-note.model';
import { NoteStore } from '../../../content/notes/state/notes-state';
import { PersonalizationService, showMenuLeftRight } from '../../services/personalization.service';

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
}
