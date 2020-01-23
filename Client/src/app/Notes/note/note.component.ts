import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Noot } from 'src/app/Models/Noots/Noot';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.sass']
})
export class NoteComponent implements OnInit {

  @Output() OpenNoot = new EventEmitter<string>();

  @Input() noot: Noot;

  constructor() { }

  color = '';
  Update = false;

  @Output() AddChanged = new EventEmitter<string>();
  @Output() RemoveChanged = new EventEmitter<string>();

  CallUpper() {
    this.Update = !this.Update;
    if (this.Update === true) {
      this.color = 'rgba(101, 226, 113, 0.69)';
      this.AddChanged.emit(this.noot.id);
    } else {
      this.color = '';
      this.RemoveChanged.emit(this.noot.id);
    }
  }
  ngOnInit() {
  }
  Open() {
    this.OpenNoot.emit(this.noot.id);
  }
}
