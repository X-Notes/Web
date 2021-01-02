import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MurriService } from 'src/app/shared/services/murri.service';

@Component({
  selector: 'app-small-note',
  templateUrl: './small-note.component.html',
  styleUrls: ['./small-note.component.scss']
})
export class SmallNoteComponent implements OnInit {

  @Input() note;
  @Output() deleteNote = new EventEmitter<number>();

  turnUpNote = false;

  constructor(public murriService: MurriService) { }

  ngOnInit(): void {
  }

  turnUpSmallNote() {
    this.turnUpNote = !this.turnUpNote;
    setTimeout(() => this.murriService.grid.refreshItems().layout(), 0);
  }

  deleteSmallNote() {
    this.deleteNote.emit(this.note);
  }

}
