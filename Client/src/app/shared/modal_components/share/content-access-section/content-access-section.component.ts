import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { SelectionOption } from 'src/app/shared/custom-components/select-component/entities/select-option';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { EnumConverterService } from 'src/app/shared/services/enum-converter.service';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';

@Component({
  selector: 'app-content-access-section',
  templateUrl: './content-access-section.component.html',
  styleUrls: ['./content-access-section.component.scss'],
})
export class ContentAccessSectionComponent {
  @Input()
  refTypeId?: RefTypeENUM;

  @Input()
  isPrivateButtonActive?: boolean;

  @Input()
  link?: string;

  @Input()
  toggleDescription?: string;

  @Input()
  dropdownActive?: boolean;

  @Input()
  currentTheme?: ThemeENUM;

  @Output()
  changeRefTypeEvent = new EventEmitter<RefTypeENUM>();

  @Output()
  changeEntityTypeEvent = new EventEmitter<void>();

  themes = ThemeENUM;

  refType = RefTypeENUM;

  constructor(
    private apiBrowserFunctions: ApiBrowserTextService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
    private enumConverterService: EnumConverterService,
  ) {}

  get refTypeSelectedValue(): RefTypeENUM | undefined {
    return this.refTypeId;
  }

  get options(): SelectionOption[] {
    return [RefTypeENUM.Viewer, RefTypeENUM.Editor].map((x) =>
      this.enumConverterService.convertEnumToSelectionOption(RefTypeENUM, x, 'modal.shareModal.'),
    );
  }

  async changeRefType(refTypeId: RefTypeENUM): Promise<void> {
    this.changeRefTypeEvent.emit(refTypeId);
  }

  async copyInputLink() {
    const input = document.getElementById('linkInput') as HTMLInputElement;
    await this.apiBrowserFunctions.copyInputLinkAsync(input);
    this.snackbarService.openSnackBar(this.translate.instant('snackBar.copied'));
  }
}
