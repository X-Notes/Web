import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dark-general-header-button',
  templateUrl: './dark-general-header-button.component.html',
  styleUrls: ['./dark-general-header-button.component.scss'],
})
export class DarkGeneralHeaderButtonComponent {
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
