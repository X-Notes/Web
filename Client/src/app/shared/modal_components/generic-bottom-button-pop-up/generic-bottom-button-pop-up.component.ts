import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-bottom-button-pop-up',
  templateUrl: './generic-bottom-button-pop-up.component.html',
  styleUrls: ['./generic-bottom-button-pop-up.component.scss'],
})
export class GenericBottomButtonPopUpComponent implements OnInit {
  @Output() clickEvent = new EventEmitter();

  @Input() title: string;

  ngOnInit(): void {}
}
