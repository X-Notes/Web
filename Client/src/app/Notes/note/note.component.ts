import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.sass']
})
export class NoteComponent implements OnInit {

  @Output() OpenNote = new EventEmitter<string>();


  constructor() { }

  color = '';
  Update = false;

  @Output() AddChanged = new EventEmitter<string>();
  @Output() RemoveChanged = new EventEmitter<string>();

  CallUpper() {
    this.Update = !this.Update;
    if (this.Update === true) {
      this.color = 'rgba(101, 226, 113, 0.69)';
      this.AddChanged.emit();
    } else {
      this.color = '';
      this.RemoveChanged.emit();
    }
  }
  ngOnInit() {
  }
  Open() {
    this.OpenNote.emit();
  }
}
