import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ExportService } from '../../../export.service';
import { DocumentModel } from '../../../models/editor-models/documents-collection';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import {
  docFormats,
  excelFormats,
  pdfFormats,
  presentationFormats,
} from '../../models/enums/type-upload-formats.enum';

@Component({
  selector: 'app-document-item',
  templateUrl: './document-item.component.html',
  styleUrls: ['../styles/inner-card.scss', './document-item.component.scss'],
})
export class DocumentItemComponent implements OnInit {
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
    private clickableService: ClickableContentService,
    private dialogsManageService: DialogsManageService,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {}

  get isClicked() {
    return this.clickableService.isClicked(this.document.fileId);
  }

  get documentIcon() {
    const type = this.document.name?.split('.').pop().toLowerCase();

    if (docFormats.some((format) => format === type)) {
      return 'microsoftWord';
    }

    if (excelFormats.some((format) => format === type)) {
      return 'microsoftExcel';
    }

    if (presentationFormats.some((format) => format === type)) {
      return 'microsoftPowerpoint';
    }

    if (pdfFormats.some((format) => format === type)) {
      return 'pdf';
    }

    return 'fileInner';
  }

  openModal(document: DocumentModel) {
    const path = this.exportService.getPath(document.documentPath, document.authorId);
    this.dialogsManageService.viewDock(path);
  }
}
