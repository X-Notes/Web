import { Component, EventEmitter, Input, Output } from '@angular/core';
import { InvitedUsersToNoteOrFolder } from 'src/app/content/notes/models/invited-users-to-note.model';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

@Component({
  selector: 'app-user-on-entity-card',
  templateUrl: './user-on-entity-card.component.html',
  styleUrls: ['./user-on-entity-card.component.scss'],
})
export class UserOnEntityCardComponent {
  @Input()
  user?: InvitedUsersToNoteOrFolder;

  @Output()
  changeUserPermission = new EventEmitter();

  @Output()
  removeUserWithPermissions = new EventEmitter();

  refType = RefTypeENUM;

  noPhoto = false;
}
