import { Component, OnInit, Input } from '@angular/core';
import { Note } from '../models/Note';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit {

  @Input() note: Note;
  isHighlight = false;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  highlight() {
    this.isHighlight = !this.isHighlight;
  }

}
