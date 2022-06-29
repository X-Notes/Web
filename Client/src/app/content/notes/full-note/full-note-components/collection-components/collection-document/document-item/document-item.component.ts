import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/services/dialogs-manage.service';
import { GenericFileExtenstionService } from '../../../../../generic-file-extenstion.service';
import { DocumentModel } from '../../../../../models/editor-models/documents-collection';
import { ClickableContentService } from '../../../../content-editor-services/clickable-content.service';
import { SelectionService } from '../../../../content-editor-services/selection.service';

@Component({
  selector: 'app-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['../../../styles/inner-card.scss', './document-item.component.scss'],
})
export class DocumentItemComponent {
  @Output()
  clickEvent = new EventEmitter<string>();

  @Output()
  deleteDocument = new EventEmitter<string>();

  @Output()
  exportAudio = new EventEmitter<DocumentModel>();

  @Input() document: DocumentModel;

  @Input() isSelectModeActive = false;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isLoading = false;

  constructor(
    private readonly clickableService: ClickableContentService,
    private readonly dialogsManageService: DialogsManageService,
    public readonly genericFileExtenstionService: GenericFileExtenstionService,
    public selectionService: SelectionService,
  ) {}

  get isClicked() {
    return this.clickableService.isClicked(this.document.fileId);
  }

  openModal(document: DocumentModel) {
    this.dialogsManageService.viewDock(document.documentPath);
  }
}
