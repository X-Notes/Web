import { Component, EventEmitter, Input, Output } from '@angular/core';

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

  clickHandler() {
    this.clickEvent.emit();
  }
}
