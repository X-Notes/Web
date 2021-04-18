import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MurriService } from 'src/app/shared/services/murri.service';
import { SmallNote } from '../models/smallNote';

@Component({
  selector: 'app-small-note',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.scss'],
})
export class SmallNoteComponent {
  @Input() note: SmallNote;

  @Output() deleteNote = new EventEmitter<string>();

  turnUpNote = false;

  constructor(public murriService: MurriService) {}

  turnUpSmallNote() {
    this.turnUpNote = !this.turnUpNote;
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  deleteSmallNote() {
    this.deleteNote.emit(this.note.id);
  }
}
