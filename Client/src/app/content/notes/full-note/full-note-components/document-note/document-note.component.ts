import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ExportService } from '../../../export.service';
import { DocumentModel, DocumentsCollection } from '../../../models/content-model.model';
import {
  docFormats,
  excelFormats,
  pdfFormats,
  presentationFormats,
} from '../../models/enums/type-upload-formats.enum';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { SetFocus } from '../../models/set-focus';
import { CollectionService } from '../collection-services/collection.service';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['../styles/inner-card.scss', './document-note.component.scss'],
})
export class DocumentNoteComponent extends CollectionService implements OnInit, ParentInteraction {
  @Output()
  deleteContentEvent = new EventEmitter<string>();

  @Output()
  deleteDocumentEvent = new EventEmitter<string>();

  @Input()
  content: DocumentsCollection;

  @Input()
  isReadOnlyMode = false;

  @Input()
  isSelected = false;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  constructor(
    private dialogsManageService: DialogsManageService,
    private exportService: ExportService,
    private host: ElementRef,
    private clickableService: ClickableContentService,
  ) {
    super();
  }

  clickDocumentHandler(document: DocumentModel) {
    this.clickableService.set(
      ClickableSelectableEntities.Document,
      document.fileId,
      this.content.id,
    );
  }

  isFocusToNext = (entity: SetFocus) => true;

  setFocus = (entity?: SetFocus) => {
    this.clickDocumentHandler(this.getFirst);
    (document.activeElement as HTMLInputElement).blur();
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {};

  getEditableNative = () => {};

  getHost() {
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

  get isClicked() {
    return this.clickableService.isClicked(this.getFirst?.fileId);
  }

  get getFirst(): DocumentModel {
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
    this.deleteIfCan();
  }

  deleteDown() {
    this.deleteIfCan();
  }

  deleteIfCan() {
    if (this.content.documents.some((x) => this.clickableService.isClicked(x.fileId))) {
      this.deleteContentEvent.emit(this.content.id);
    }
  }
}
