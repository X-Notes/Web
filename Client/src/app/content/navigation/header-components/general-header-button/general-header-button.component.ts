import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GeneralButtonStyleType } from './models/general-button-style-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  selector: 'app-general-header-button',
  templateUrl: './general-header-button.component.html',
  styleUrls: ['./general-header-button.component.scss'],
})
export class GeneralHeaderButtonComponent {
  @Output()
  clickEvent = new EventEmitter();

  @Input()
  tooltipMessage: string;

  @Input()
  tooltipPosition: string;

  @Input()
  styleClasses: string;

  @Input()
  message: string;

  @Input()
  iconClass: string;

  @Input()
  stateIconClass: string;

  @Input()
  isDefault = false;

  @Input()
  isClassOnSize: boolean;

  @Input()
  classOnSize: string;

  @Input()
  styleType: GeneralButtonStyleType = GeneralButtonStyleType.Light;

  @Input()
  theme: ThemeENUM;

  @Input()
  width?: number;

  get isActiveMessage() {
    return this.message?.length > 0;
  }

  get styleTypeClass(): string {
    switch (this.theme) {
      case ThemeENUM.Dark: {
        return this.darkStyleTypeClass;
      }
      case ThemeENUM.Light: {
        return this.lightStyleTypeClass;
      }
      default: {
        return '';
      }
    }
  }

  get lightStyleTypeClass(): string {
    switch (this.styleType) {
      case GeneralButtonStyleType.Light: {
        return 'light-light-button';
      }
      case GeneralButtonStyleType.Dark: {
        return 'light-light-button';
      }
      default: {
        return '';
      }
    }
  }

  get darkStyleTypeClass(): string {
    switch (this.styleType) {
      case GeneralButtonStyleType.Light: {
        return 'dark-light-button';
      }
      case GeneralButtonStyleType.Dark: {
        return 'dark-dark-button';
      }
      default: {
        return '';
      }
    }
  }

  clickHandler() {
    this.clickEvent.emit();
  }
}
