import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { InvitationFormResult } from './models/invitation-form-result';

@Component({
  selector: 'app-mail-invitations',
  templateUrl: './mail-invitations.component.html',
  styleUrls: ['./mail-invitations.component.scss'],
})
export class MailInvitationsComponent implements AfterViewInit {
  @Output() applyForm = new EventEmitter<InvitationFormResult>();

  form: InvitationFormResult = new InvitationFormResult();

  refType = RefTypeENUM;

  defaultRefType = RefTypeENUM.Viewer;

  refTypes = Object.values(RefTypeENUM).filter((x) => typeof x === 'string');

  refTypeNotification(refType: RefTypeENUM): void {
    this.form.refTypeForInvite = refType;
  }

  ngAfterViewInit(): void {}
}
