import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ExportService } from '../../../export.service';
import { GenericFileExtenstionService } from '../../../generic-file-extenstion.service';
import { DocumentModel } from '../../../models/editor-models/documents-collection';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';

@Component({
  selector: 'app-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['../styles/inner-card.scss', './document-item.component.scss'],
})
export class DocumentItemComponent {
  @Output()
  clickEvent = new EventEmitter<string>();

  @Output()
  deleteDocument = new EventEmitter<string>();

  @Output()
  exportAudio = new EventEmitter<DocumentModel>();

  @Input() document: DocumentModel;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isLoading = false;

  constructor(
    private readonly clickableService: ClickableContentService,
    private readonly dialogsManageService: DialogsManageService,
    private readonly exportService: ExportService,
    public readonly genericFileExtenstionService: GenericFileExtenstionService,
  ) {}

  get isClicked() {
    return this.clickableService.isClicked(this.document.fileId);
  }

  openModal(document: DocumentModel) {
    const path = this.exportService.getPath(document.documentPath, document.authorId);
    this.dialogsManageService.viewDock(path);
  }
}
