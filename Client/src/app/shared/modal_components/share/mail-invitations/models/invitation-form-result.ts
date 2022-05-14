import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export class InvitationFormResult {
  messageTextArea: string;

  isSendNotification: boolean;

  refTypeForInvite: RefTypeENUM;

  constructor() {
    this.refTypeForInvite = RefTypeENUM.Viewer;
  }
}
