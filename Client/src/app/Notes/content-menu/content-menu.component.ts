import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-content-menu',
  templateUrl: './content-menu.component.html',
  styleUrls: ['./content-menu.component.sass']
})
export class ContentMenuComponent implements OnInit {

  @Output() checkList = new EventEmitter();
  @Output() dotList = new EventEmitter();
  @Output() numberList = new EventEmitter();
  @Output() image = new EventEmitter();
  @Output() hOne = new EventEmitter();
  @Output() hTwo = new EventEmitter();
  @Output() hThree = new EventEmitter();
  @Output() voice = new EventEmitter();
  @Output() location = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  CheckList() {
    this.checkList.emit();
  }
  DotList() {
    this.dotList.emit();
  }
  NumberList() {
    this.numberList.emit();
  }
  HOne() {
    this.hOne.emit();
  }
  HTwo() {
    this.hTwo.emit();
  }
  HThree() {
    this.hThree.emit();
  }
}
