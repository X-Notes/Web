import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { PersonalizationService } from 'src/app/shared/services/personalization.service';
import { EntitiesSizeENUM } from 'src/app/shared/enums/font-size.enum';
import { SmallNote } from '../models/small-note.model';
import { NoteTypeENUM } from 'src/app/shared/enums/note-types.enum';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { ContentTypeENUM } from 'src/app/editor/entities/contents/content-types.enum';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { SelectNoteEvent } from './entities/select-note.event';
import { Select } from '@ngxs/store';
import { UserStore } from 'src/app/core/stateUser/user-state';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PersonalizationSetting } from 'src/app/core/models/personalization-setting.model';

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

  @Input() personalization?: PersonalizationSetting;

  @Input() isSelected?: boolean;

  @Input() highlightCursorActive = true;

  @Output() highlightNote = new EventEmitter<SelectNoteEvent>();

  @Output() clickOnNote = new EventEmitter<SmallNote>();

  fontSize = EntitiesSizeENUM;

  noteType = NoteTypeENUM;

  contentType = ContentTypeENUM;

  contents?: ContentModelBase[];

  constructor(
    public pService: PersonalizationService,
    private translate: TranslateService) { }

  get hasRelatedNotes(): boolean {
    return this.note?.additionalInfo?.noteRelatedNotes?.length > 0;
  }

  get hasFolderNotes(): boolean {
    return this.note?.additionalInfo?.noteFolderInfos?.length > 0;
  }

  get relatedNotesMessage(): string {
    return this.note?.additionalInfo?.noteRelatedNotes?.map(x => `<p>${x.name || this.translate.instant('placeholder.unnamedNote')}</p>`).reduce((p, c) => p + c) ?? '';
  }

  get foldersNotesMessage(): string {
    return this.note?.additionalInfo?.noteFolderInfos?.map(x => `<p>${x.folderName || this.translate.instant('placeholder.unnamedFolder')}</p>`).reduce((p, c) => p + c) ?? '';
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

  get title(): string {
    if (this.note?.title?.length > 0) {
      return this.note?.title?.replace(/[\n\r]/g, '');
    }
    return '';
  }

  ngOnInit(): void {
    this.syncContent();
  }

  getLabelMaxWidth(count: number, color: string) {
    return {
      maxWidth: `calc(100% / ${count} - 0.5rem)`,
      backgroundColor: color
    };
  }

  syncContent(): void {
    this.contents = this.note.contents.map(x => ({ ...x } as ContentModelBase));
  }

  get getContents(): ContentModelBase[] {
    if (!this.contents || this.contents.length === 0) {
      return [];
    }
    if(!this.personalization) {
      return this.contents;
    }
    return this.contents.filter(x => {
      if (x.typeId === ContentTypeENUM.Text && this.personalization.isViewTextOnNote) {
        return true;
      }
      if (x.typeId === ContentTypeENUM.Audios && this.personalization.isViewAudioOnNote) {
        return true;
      }
      if (x.typeId === ContentTypeENUM.Documents && this.personalization.isViewDocumentOnNote) {
        return true;
      }
      if (x.typeId === ContentTypeENUM.Videos && this.personalization.isViewVideoOnNote) {
        return true;
      }
      if (x.typeId === ContentTypeENUM.Photos && this.personalization.isViewPhotosOnNote) {
        return true;
      }
      return false;
    });
  }

  getTextContent(index: number): BaseText {
    return this.contents[index] as BaseText;
  }

  getNumberList(content: ContentModelBase, contentIndex: number): number {
    const text = content as BaseText;
    const prev = this.getTextContent(contentIndex - 1);
    if (!prev || prev.metadata?.noteTextTypeId !== NoteTextTypeENUM.numberList) {
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
