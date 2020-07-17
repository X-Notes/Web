import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  isHighlight = false;

  constructor() { }

  ngOnInit(): void {
  }

  highlight() {
    this.isHighlight = !this.isHighlight;
  }

}
