import { Component, Input } from "@angular/core";
import { ContentModelBase } from "src/app/editor/entities/contents/content-model-base";
import { DocumentsCollection } from "src/app/editor/entities/contents/documents-collection";
import { GenericFileExtenstionService } from "src/app/editor/ui-services/generic-file-extenstion.service";


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
