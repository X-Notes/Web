import { Component, Input } from '@angular/core';
import { GenericNoteService } from '../../generic-note.service';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { BaseFile } from '../../models/editor-models/base-file';

@Component({
  selector: 'app-note-preview-documents',
  templateUrl: './note-preview-documents.component.html',
  styleUrls: ['./note-preview-documents.component.scss'],
})
export class NotePreviewDocumentsComponent {
  @Input()
  content: BaseCollection<BaseFile>;

  constructor(public readonly genericNoteService: GenericNoteService) {}
}
