import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';
import { FontSize } from 'src/app/shared/enums/FontSize';


@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})

export class NoteComponent implements OnInit, OnDestroy {

  fontSize = FontSize;

  @Input() note: SmallNote;
  @Output() highlightNote = new EventEmitter<SmallNote>();
  @Output() clickOnNote = new EventEmitter<SmallNote>();

  constructor(public pService: PersonalizationService) { }


  ngOnDestroy(): void {
  }

  ngOnInit(): void {
  }

  highlight(note: SmallNote) {
    this.highlightNote.emit(note);
  }

  toNote(note: SmallNote) {
    this.clickOnNote.emit(note);
  }

}
