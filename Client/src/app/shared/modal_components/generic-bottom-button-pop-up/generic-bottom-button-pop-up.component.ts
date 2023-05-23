import { Component, EventEmitter, Input, Output, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-generic-bottom-button-pop-up',
  templateUrl: './generic-bottom-button-pop-up.component.html',
  styleUrls: ['./generic-bottom-button-pop-up.component.scss'],
})
export class GenericBottomButtonPopUpComponent {
  @Output() clickEvent = new EventEmitter();

  @Input() title?: string;
}
