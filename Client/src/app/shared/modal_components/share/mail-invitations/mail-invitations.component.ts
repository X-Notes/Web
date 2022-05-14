import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { SearchUserForShareModal } from 'src/app/shared/models/short-user-for-share-modal.model';
import { InvitationFormResult } from './models/invitation-form-result';

@Component({
  selector: 'app-mail-invitations',
  templateUrl: './mail-invitations.component.html',
  styleUrls: ['./mail-invitations.component.scss'],
})
export class MailInvitationsComponent implements AfterViewInit {
  @ViewChild('scrollbar') scrollbar: ElementRef;

  @Output() removeUserFromInvites = new EventEmitter<SearchUserForShareModal>();

  @Output() applyForm = new EventEmitter<InvitationFormResult>();

  @Input() selectedUsers: SearchUserForShareModal[] = [];

  form: InvitationFormResult = new InvitationFormResult();

  refType = RefTypeENUM;

  defaultRefType = RefTypeENUM.Viewer;

  isInitView = false;

  refTypes = Object.values(RefTypeENUM).filter((x) => typeof x === 'string');

  refTypeNotification(refType: RefTypeENUM): void {
    this.form.refTypeForInvite = refType;
  }

  ngAfterViewInit(): void {
    setTimeout(() => (this.isInitView = true), 100); // TODO wait when scroll in inited
  }
}
