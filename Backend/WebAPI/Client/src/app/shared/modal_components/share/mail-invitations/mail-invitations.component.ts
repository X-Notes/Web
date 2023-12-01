import { AfterViewInit, Component, EventEmitter, Output } from '@angular/core';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { InvitationFormResult } from './models/invitation-form-result';
import { SelectionOption } from 'src/app/shared/custom-components/select-component/entities/select-option';
import { EnumConverterService } from 'src/app/shared/services/enum-converter.service';

@Component({
  selector: 'app-mail-invitations',
  templateUrl: './mail-invitations.component.html',
  styleUrls: ['./mail-invitations.component.scss'],
})
export class MailInvitationsComponent implements AfterViewInit {
  @Output() applyForm = new EventEmitter<InvitationFormResult>();

  form: InvitationFormResult = new InvitationFormResult();

  defaultRefType = RefTypeENUM.Viewer;

  constructor(private enumConverterService: EnumConverterService) {}

  get options(): SelectionOption[] {
    return [RefTypeENUM.Viewer, RefTypeENUM.Editor].map((x) =>
      this.enumConverterService.convertEnumToSelectionOption(RefTypeENUM, x, 'modal.shareModal.'),
    );
  }

  refTypeNotification(refType: RefTypeENUM): void {
    this.form.refTypeForInvite = refType;
  }

  ngAfterViewInit(): void {}
}
