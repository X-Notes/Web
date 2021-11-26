import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-collection',
  templateUrl: './button-collection.component.html',
  styleUrls: ['./button-collection.component.scss'],
})
export class ButtonCollectionComponent {
  @Output()
  clickEvent = new EventEmitter();

  @Input()
  button: string;

  @Input()
  disabled = false;

  @Input()
  tooltip: string;

  @Input()
  position: string;

  @Input()
  classes: string;

  @Input()
  iconClasses: string;

  @Input()
  matIconClasses: string;

  @Input()
  inline = true;

  @Input()
  isActive = false;

  @Input()
  activeColor: string;
}
