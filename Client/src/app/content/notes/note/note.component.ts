import { Component, OnInit, Input } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit {
  isHighlight = false;
  @Input() note: SmallNote;

  constructor(public pService: PersonalizationService) { }

  ngOnInit(): void {
  }

  highlight() {
    this.isHighlight = !this.isHighlight;
  }

}
