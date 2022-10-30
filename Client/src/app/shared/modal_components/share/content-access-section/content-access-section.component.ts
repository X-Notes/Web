import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { RefTypeENUM } from 'src/app/shared/enums/ref-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';

@Component({
  selector: 'app-content-access-section',
  templateUrl: './content-access-section.component.html',
  styleUrls: ['./content-access-section.component.scss'],
})
export class ContentAccessSectionComponent implements OnInit {
  @Input()
  refTypeId: RefTypeENUM;

  @Input()
  isPrivateButtonActive: boolean;

  @Input()
  link: string;

  @Input()
  toggleDescription: string;

  @Input()
  dropdownActive: boolean;

  @Input()
  currentTheme: ThemeENUM;

  @Output()
  changeRefTypeEvent = new EventEmitter<RefTypeENUM>();

  @Output()
  changeEntityTypeEvent = new EventEmitter<void>();

  themes = ThemeENUM;

  refType = RefTypeENUM;

  public refTypes = Object.values(RefTypeENUM).filter((x) => typeof x === 'string');

  constructor(
    private apiBrowserFunctions: ApiBrowserTextService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {}

  get refTypeSelectedValue(): string {
    return this.refType[this.refTypeId];
  }

  ngOnInit(): void {}

  async changeRefType(refTypeId: string): Promise<void> {
    const refType = this.refType[refTypeId]; // TODO map from string to number;
    this.changeRefTypeEvent.emit(refType);
  }

  async copyInputLink() {
    const input = document.getElementById('linkInput') as HTMLInputElement;
    await this.apiBrowserFunctions.copyInputLinkAsync(input);
    this.snackbarService.openSnackBar(this.translate.instant('snackBar.copied'));
  }
}
