import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { SmallNote } from '../models/small-note.model';
import dayjs from 'dayjs';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { ContentTypeENUM } from 'src/app/editor/entities/contents/content-types.enum';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { SelectNoteEvent } from './entities/select-note.event';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
})
export class NoteComponent implements OnInit {
  
  @Select(UserStore.getUserFontSize)
  public fontSize$?: Observable<EntitiesSizeENUM>;
  
  @Input() note?: SmallNote;

  @Input() date?: string;

  @Input() isShowWrightRead = false;

  @Input() tooltipDateMessage?: string;

  @Input() currentFolderId?: string;

  @Input() userId?: string;

  @Input() isSelected?: boolean;

  @Input() highlightCursorActive = true;

  @Output() highlightNote = new EventEmitter<SelectNoteEvent>();

  @Output() clickOnNote = new EventEmitter<SmallNote>();

  fontSize = EntitiesSizeENUM;

  noteType = NoteTypeENUM;

  contentType = ContentTypeENUM;

  contents?: ContentModelBase[];

  constructor(public pService: PersonalizationService) { }

  get noteFolders() {
    return this.note?.additionalInfo?.noteFolderInfos?.filter(
      (folder) => folder.folderId !== this.currentFolderId,
    );
  }

  get hasRelatedNotes(): boolean {
    return this.note?.additionalInfo?.noteRelatedNotes?.length > 0;
  }

  get hasFolderNotes(): boolean {
    return this.note?.additionalInfo?.noteRelatedNotes?.length > 0;
  }

  get relatedNotesMessage(): string {
    return this.note?.additionalInfo?.noteRelatedNotes.map(x =>  `<p>${x.name}</p>`).reduce((p, c) => p + c);
  }

  get foldersNotesMessage(): string {
    return this.note?.additionalInfo?.noteFolderInfos.map(x =>  `<p>${x.folderName}</p>`).reduce((p, c) => p + c);
  }

  get isAuthor(): boolean {
    return this.userId === this.note?.userId;
  }

  get size() {
    if (this.note?.additionalInfo) {
      const size = this.note.additionalInfo.totalSize;
      const mb = Math.ceil(size / Math.pow(1024, 2));
      if (mb) {
        return `, ${mb}mb`;
      }
    }
    return null;
  }

  get unlockedTime() {
    return dayjs(this.note.unlockedTime).add(5, 'minutes').format('LT');
  }

  ngOnInit(): void {
    this.syncContent();
  }

  syncContent(): void {
    this.contents = this.note.contents.map(x => ({ ...x } as ContentModelBase));
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  getNumberList(content: ContentModelBase, contentIndex: number): number {
    const text = content as BaseText;
    const prev = this.getTextContent(contentIndex - 1);
    if (!prev || prev.noteTextTypeId !== NoteTextTypeENUM.numberList) {
      text.listNumber = 1;
      return text.listNumber;
    }
    text.listNumber = prev.listNumber + 1;
    return text.listNumber;
  }

  highlight(): void {
    this.highlightNote.emit({ isSelected: this.isSelected, note: this.note });
  }

  toNote(note: SmallNote): void {
    this.clickOnNote.emit(note);
  }
}
