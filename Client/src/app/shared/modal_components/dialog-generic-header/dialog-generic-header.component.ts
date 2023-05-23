import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-generic-header',
  templateUrl: './dialog-generic-header.component.html',
  styleUrls: ['./dialog-generic-header.component.scss'],
})
export class DialogGenericHeaderComponent {
  @Output()
  clickEvent = new EventEmitter();

  @Input()
  isMessage = true;

  @Input()
  iconDisabled = false;

  @Input()
  message?: string;

  get basicStyles() {
    return this.isMessage ? 'is-message' : 'no-message';
  }

  clickHandler() {
    this.clickEvent.emit();
  }
}
