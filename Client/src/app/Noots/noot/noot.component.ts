import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Noot } from 'src/app/Models/Noots/Noot';

@Component({
  selector: 'app-noot',
  templateUrl: './noot.component.html',
  styleUrls: ['./noot.component.sass']
})
export class NootComponent implements OnInit {

  @Output() OpenNoot = new EventEmitter<string>();

  @Input() noot: Noot;

  constructor() { }

  ngOnInit() {
  }
  Open() {
    this.OpenNoot.emit(this.noot.id);
  }
}
