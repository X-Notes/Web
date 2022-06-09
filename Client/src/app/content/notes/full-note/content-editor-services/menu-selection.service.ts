import { Injectable } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';

@Injectable()
export class MenuSelectionService {
  public currentTextItem: BaseText;

  public startTop = 0;

  public startScroll = 0;

  public currentScroll = 0;

  public left = 0;

  constructor(
    private pS: PersonalizationService,
    private apiBrowserService: ApiBrowserTextService,
  ) {}

  get menuActive() {
    return this.currentTextItem !== null && this.currentTextItem !== undefined;
  }

  get getLeft(): number {
    if (this.pS.windowWidth$.value < this.pS.startMobileWidth) {
      return 0;
    }
    return this.left;
  }

  get getTop() {
    if (this.pS.windowWidth$.value < this.pS.startMobileWidth) {
      return 0;
    }
    return this.startTop + this.startScroll - this.currentScroll;
  }

  clearItemAndSelection(): void {
    this.currentTextItem = null;
    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }
}
