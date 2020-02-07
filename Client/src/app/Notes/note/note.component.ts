import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SmallNote } from 'src/app/Models/Notes/SmallNote';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.sass']
})
export class NoteComponent implements OnInit {

  @Output() OpenNote = new EventEmitter<string>();
  @Input() note: SmallNote;

  constructor() { }

  color = '';
  Update = false;

  @Output() AddChanged = new EventEmitter<string>();
  @Output() RemoveChanged = new EventEmitter<string>();

  CallUpper() {
    this.Update = !this.Update;
    if (this.Update === true) {
      this.color = 'rgba(101, 226, 113, 0.69)';
      this.AddChanged.emit(this.note.id);
    } else {
      this.color = '';
      this.RemoveChanged.emit(this.note.id);
    }
  }

  ngOnInit() {
  }

  Open() {
    this.OpenNote.emit(this.note.id);
  }
}
