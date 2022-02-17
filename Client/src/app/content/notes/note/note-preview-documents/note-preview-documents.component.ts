import { Component, Input } from '@angular/core';
import { GenericFileExtenstionService } from '../../generic-file-extenstion.service';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { DocumentModel } from '../../models/editor-models/documents-collection';

@Component({
  selector: 'app-note-preview-documents',
  templateUrl: './note-preview-documents.component.html',
  styleUrls: ['./note-preview-documents.component.scss'],
})
export class NotePreviewDocumentsComponent {
  @Input()
  content: BaseCollection<DocumentModel>;

  constructor(public readonly genericFileExtenstionService: GenericFileExtenstionService) {}
}
