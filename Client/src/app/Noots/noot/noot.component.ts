import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-noot',
  templateUrl: './noot.component.html',
  styleUrls: ['./noot.component.sass']
})
export class NootComponent implements OnInit {

  constructor() { }

  acceptCommon = 'assets/highlighting/accept-common.svg';
  acceptWhite = 'assets/highlighting/accept-white.svg';
  update = true;
  color = '';
  colorUpdate = false;
  @Output() Changed = new EventEmitter<boolean>();

  changeColor() {
    this.colorUpdate = !this.colorUpdate;
    if (this.colorUpdate === true) {
      this.color = 'rgba(101, 226, 113, 0.69)';
      this.update = false;
      this.Changed.emit(this.update);
    } else {
      this.update = true;
      this.color = '';
      this.Changed.emit(this.update);
    }
  }
  ngOnInit() {
  }

}
