import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { FontSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { SmallNote } from '../models/small-note.model';
import { ContentTypeENUM } from '../models/editor-models/content-types.enum';
import { BaseText, NoteTextTypeENUM } from '../models/editor-models/base-text';
import { ContentModelBase } from '../models/editor-models/content-model-base';
import * as moment from 'moment';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit {
  @Input() note: SmallNote;

  @Input() date: string;

  @Input() tooltipDateMessage: string;

  @Input() currentFolderId: string;

  @Output() highlightNote = new EventEmitter<SmallNote>();

  @Output() clickOnNote = new EventEmitter<SmallNote>();

  fontSize = FontSizeENUM;

  contentType = ContentTypeENUM;

  contents: ContentModelBase[];

  constructor(public pService: PersonalizationService) {}

  get noteFolders() {
    return this.note.additionalInfo?.noteFolderInfos?.filter(
      (folder) => folder.folderId !== this.currentFolderId,
    );
  }

  get unlockedTime() {
    return moment(this.note.unlockedTime).add(5, 'minutes').format('LT');
  }

  ngOnInit(): void {
    let num = 1;
    this.contents = this.note.contents.map((item, index, array) => {
      const prev = array[index - 1];
      if (item instanceof BaseText && item.noteTextTypeId === NoteTextTypeENUM.Numberlist) {
        return {
          ...item,
          listNumber: item.listId === (prev as BaseText)?.listId ? (num += 1) : (num = 1),
        };
      }
      return item;
    }) as unknown as ContentModelBase[];
  }

  highlight(note: SmallNote) {
    this.highlightNote.emit(note);
  }

  toNote(note: SmallNote) {
    this.clickOnNote.emit(note);
  }
}
