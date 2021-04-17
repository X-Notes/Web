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
  icon: string;

  @Input()
  autoClose = true;

  @Input()
  message: string;

  clickHandler() {
    this.clickEvent.emit();
  }

  get basicStyles() {
    return this.isMessage ? 'is-message' : 'no-message';
  }
}
