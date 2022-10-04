import { ElementRef, Injectable } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';

@Injectable()
export class MenuSelectionService {
  private currentTextItemHtml: ElementRef<HTMLElement>;

  private currentTextItem: BaseText;

  private startScroll = 0;

  private currentScroll = 0;

  private top = 0;

  private left = 0;

  constructor(
    private pS: PersonalizationService,
    private apiBrowserService: ApiBrowserTextService,
  ) {}

  get selectedHtmlItemRect(): DOMRect {
    return this.selectedHtmlItem.nativeElement.getBoundingClientRect();
  }

  get selectedHtmlItem(): ElementRef<HTMLElement> {
    return this.currentTextItemHtml;
  }

  get selectedTextItem(): BaseText {
    return this.currentTextItem;
  }

  get menuActive() {
    return this.currentTextItem !== null && this.currentTextItem !== undefined;
  }

  get getCursorLeft(): number {
    if (this.pS.windowWidth$.value < this.pS.startMobileWidth) {
      return 0;
    }
    return this.left;
  }

  get getCursorTop() {
    if (this.pS.windowWidth$.value < this.pS.startMobileWidth) {
      return 0;
    }
    return this.top + this.startScroll - this.currentScroll;
  }

  clearItemAndSelection(): void {
    this.cleatItem();

    const selection = this.apiBrowserService.getSelection();
    selection.removeAllRanges();
  }

  cleatItem(): void {
    this.currentTextItem = null;
    this.currentTextItemHtml = null;
  }

  init(
    currentTextItemHtml: ElementRef<HTMLElement>,
    currentTextItem: BaseText,
    top: number,
    left: number,
    startScroll: number,
  ): void {
    this.currentTextItemHtml = currentTextItemHtml;
    this.currentTextItem = currentTextItem;
    this.top = top;
    this.left = left;
    this.startScroll = startScroll;
  }
}
