import { Component, EventEmitter, Input, Optional, Output } from '@angular/core';

@Component({
  selector: 'app-button-toggle',
  templateUrl: './button-toggle.component.html',
  styleUrls: ['./button-toggle.component.scss'],
})
export class ButtonToggleComponent {
  @Input() value: boolean;

  @Input()
  @Optional()
  style: string;

  @Output()
  valueChange = new EventEmitter<boolean>();

  modelChangeFn(value) {
    this.valueChange.emit(value);
  }
}
