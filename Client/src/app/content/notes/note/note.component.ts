import { Component, OnInit, Input } from '@angular/core';
import { Note } from '../models/Note';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  @Input() note: Note;
  isHighlight = false;

  constructor() { }

  ngOnInit(): void {
  }

  highlight() {
    this.isHighlight = !this.isHighlight;
  }

}
