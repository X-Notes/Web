import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';

@Component({
  selector: 'app-button-toggle',
  templateUrl: './button-toggle.component.html',
  styleUrls: ['./button-toggle.component.scss']
})
export class ButtonToggleComponent implements OnInit {

  @Input() value: boolean;

  @Input()
  @Optional()
  style: string;

  @Output()
  valueChange = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  modelChangeFn(value) {
    this.value = value;
    this.valueChange.emit(this.value);
  }

}
