import { Component, Input } from '@angular/core';
import { GenericFileExtenstionService } from '../../generic-file-extenstion.service';
import { BaseCollection } from '../../models/editor-models/base-collection';
import {
  DocumentModel,
  DocumentsCollection,
} from '../../models/editor-models/documents-collection';
import { ContentModelBase } from '../../models/editor-models/content-model-base';

@Component({
  selector: 'app-note-preview-documents',
  templateUrl: './note-preview-documents.component.html',
  styleUrls: ['./note-preview-documents.component.scss'],
})
export class NotePreviewDocumentsComponent {
  _content: DocumentsCollection;

  @Input() set content(value: ContentModelBase) {
    this._content = value as DocumentsCollection;
  }

  constructor(public readonly genericFileExtenstionService: GenericFileExtenstionService) {}
}
