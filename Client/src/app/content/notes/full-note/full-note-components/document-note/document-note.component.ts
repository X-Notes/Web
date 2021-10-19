import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ExportService } from '../../../export.service';
import { DocumentModel, DocumentsCollection } from '../../../models/content-model.model';
import {
  docFormats,
  excelFormats,
  pdfFormats,
  presentationFormats,
} from '../../models/enums/type-upload-formats.enum';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import {
  ClickableContentService,
  ClickableSelectableEntities,
} from '../../content-editor-services/clickable-content.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['../styles/inner-card.scss'],
})
export class DocumentNoteComponent implements OnInit, ParentInteraction {
  @Input()
  content: DocumentsCollection;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;
  
  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteDocumentEvent = new EventEmitter<string>();

  constructor(
    private dialogsManageService: DialogsManageService,
    private exportService: ExportService,
    private clickableContentService: ClickableContentService,
    private host: ElementRef
  ) {}

  clickDocumentHandler(document: DocumentModel) {
    this.clickableContentService.set(
      ClickableSelectableEntities.Document,
      document.fileId,
      this.content.id,
    );
  }

  setFocus = ($event?: any) => {};

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getHost(){
    return this.host;
  }
  
  getContent() {
    return this.content;
  }

  async exportDocuments(documents: DocumentsCollection) {
    await this.exportService.exportDocuments(documents);
  }

  async exportDocument(document: DocumentModel) {
    await this.exportService.exportDocument(document);
  }

  documentIcon() {
    const type = this.content.name?.split('.').pop().toLowerCase();

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

  get getFirst() {
    if (this.content.documents && this.content.documents.length > 0) {
      return this.content.documents[0];
    }
  }

  get isEmpty(): boolean {
    if (!this.content.documents || this.content.documents.length === 0) {
      return true;
    }
    return false;
  }

  openModal(document: DocumentModel) {
    const path = this.exportService.getPath(document.documentPath, document.authorId);
    this.dialogsManageService.viewDock(path);
  }

  mouseEnter = ($event: any) => {};

  mouseOut = ($event: any) => {};

  ngOnInit = () => {};

  // eslint-disable-next-line class-methods-use-this
  backspaceUp() {}

  // eslint-disable-next-line class-methods-use-this
  backspaceDown() {
    this.checkForDelete();
  }

  deleteDown() {
    this.checkForDelete();
  }

  checkForDelete() {
    const audioId = this.clickableContentService.id;
    if (
      this.clickableContentService.collectionId === this.content.id &&
      this.content.documents.some((x) => x.fileId === audioId)
    ) {
      this.deleteDocumentEvent.emit(audioId);
    }
  }
}
