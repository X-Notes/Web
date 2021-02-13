import { Component, OnInit, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { SmallNote } from '../models/smallNote';
import { Store } from '@ngxs/store';
import { SelectIdNote, UnSelectIdNote } from '../state/notes-actions';
import { Router } from '@angular/router';
import { NoteStore } from '../state/notes-state';
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

  constructor(public pService: PersonalizationService,
              private store: Store,
              private router: Router) { }


  ngOnDestroy(): void {

  }

  ngOnInit(): void {

  }

  highlight(note: SmallNote) {
    this.highlightNote.emit(note);
  }

  toNote() {
    const isSelectedMode = this.store.selectSnapshot(NoteStore.selectedCount) > 0 ? true : false;
    if (isSelectedMode) {
      this.highlight(this.note);
    } else {
      this.router.navigate([`notes/${this.note.id}`]);
    }
  }

}
