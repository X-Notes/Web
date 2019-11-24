import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-noot',
  templateUrl: './noot.component.html',
  styleUrls: ['./noot.component.sass']
})
export class NootComponent implements OnInit {

  constructor() { }
  update = true;
  @Output() Changed = new EventEmitter<boolean>();
  change(increased: any) {
      this.Changed.emit(increased);
      console.log(2, increased);
  }
  ngOnInit() {
  }

}
