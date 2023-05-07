import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';

export class InvitationFormResult {
  refTypeForInvite: RefTypeENUM;

  constructor() {
    this.refTypeForInvite = RefTypeENUM.Viewer;
  }
}
