import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { showDropdown } from '../../services/personalization.service';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  animations: [ showDropdown ]
})
export class SelectComponent implements OnInit {

  isOpen = false;
  dublicateArray = [];
  @Input() array: Array<any>;
  @Input() selectedItem: string;
  @Input() translateItem: string;
  @Output() changeItem = new EventEmitter<string>();

  public positions = [
    new ConnectionPositionPair({
      originX: 'end',
      originY: 'bottom'},
      {overlayX: 'end',
      overlayY: 'top'},
      0, 1)
];

  constructor() { }

  ngOnInit(): void {
    this.dublicateArray = this.array;
    this.array = this.array.filter(x => x !== this.selectedItem);
  }

  setItem(item) {
    this.array = this.dublicateArray;
    this.array = this.array.filter(x => x !== item);
    this.selectedItem = item;
    this.changeItem.emit(item);
    this.isOpen = false;
  }

  closeDropdown() {
    this.isOpen = false;
  }

}
