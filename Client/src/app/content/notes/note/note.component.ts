import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { SmallNote } from '../models/small-note.model';
import { ContentTypeENUM } from '../models/editor-models/content-types.enum';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent {
  @Input() note: SmallNote;

  @Input() currentFolderId: string;

  @Output() highlightNote = new EventEmitter<SmallNote>();

  @Output() clickOnNote = new EventEmitter<SmallNote>();

  fontSize = FontSizeENUM;

  contentType = ContentTypeENUM;

  constructor(public pService: PersonalizationService) {}

  highlight(note: SmallNote) {
    this.highlightNote.emit(note);
  }

  toNote(note: SmallNote) {
    this.clickOnNote.emit(note);
  }

  get noteFolders() {
    return this.note.additionalInfo?.noteFolderInfos?.filter(
      (folder) => folder.folderId !== this.currentFolderId,
    );
  }
}
