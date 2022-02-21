import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { SmallNote } from '../models/small-note.model';
import { ContentTypeENUM } from '../models/editor-models/content-types.enum';
import { BaseText } from '../models/editor-models/base-text';
import { ContentModelBase } from '../models/editor-models/content-model-base';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit {
  @Input() note: SmallNote;

  @Input() currentFolderId: string;

  @Output() highlightNote = new EventEmitter<SmallNote>();

  @Output() clickOnNote = new EventEmitter<SmallNote>();

  fontSize = FontSizeENUM;

  contents: ContentModelBase[];

  contentType = ContentTypeENUM;

  constructor(public pService: PersonalizationService) {}

  get noteFolders() {
    return this.note.additionalInfo?.noteFolderInfos?.filter(
      (folder) => folder.folderId !== this.currentFolderId,
    );
  }

  ngOnInit(): void {
    this.contents = this.note.contents.map((x) => x.copy());
  }

  getTextContentOrNull(index: number): BaseText {
    if (index >= 0 && this.contents[index].typeId === ContentTypeENUM.Text) {
      return this.contents[index] as BaseText;
    }
    return null;
  }

  highlight(note: SmallNote) {
    this.highlightNote.emit(note);
  }

  toNote(note: SmallNote) {
    this.clickOnNote.emit(note);
  }
}
