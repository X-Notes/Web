import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-font-content-menu',
  templateUrl: './font-content-menu.component.html',
  styleUrls: ['./font-content-menu.component.sass']
})
export class FontContentMenuComponent implements OnInit {

  @Output() bold = new EventEmitter();
  @Output() dotList = new EventEmitter();
  @Output() numberList = new EventEmitter();
  @Output() italics = new EventEmitter();
  @Output() hOne = new EventEmitter();
  @Output() hTwo = new EventEmitter();
  @Output() hThree = new EventEmitter();
  @Output() checkList = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  boldEvent() {
    this.bold.emit();
  }
  italicEvent() {
    this.italics.emit();
  }
}
