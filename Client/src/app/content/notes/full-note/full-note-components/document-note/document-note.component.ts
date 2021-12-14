import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';
import { ExportService } from '../../../export.service';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { CollectionService } from '../collection-services/collection.service';
import { ClickableSelectableEntities } from '../../content-editor-services/clickable-selectable-entities.enum';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import {
  DocumentModel,
  DocumentsCollection,
} from '../../../models/editor-models/documents-collection';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['./document-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentNoteComponent extends CollectionService implements OnInit, ParentInteraction {
  @ViewChild('uploadRef') uploadRef: ElementRef;

  @Output()
  deleteDocumentEvent = new EventEmitter<string>();

  @Input()
  content: DocumentsCollection;

  @Input()
  theme: ThemeENUM;

  themeE = ThemeENUM;

  formats = TypeUploadFormats.documents;

  constructor(
    private dialogsManageService: DialogsManageService,
    private exportService: ExportService,
    private host: ElementRef,
    private clickableService: ClickableContentService,
    cdr: ChangeDetectorRef,
  ) {
    super(cdr);
  }

  clickDocumentHandler(documentId: string) {
    this.clickableService.set(ClickableSelectableEntities.Document, documentId, this.content.id);
  }

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.documents.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.documents.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    const isExist = this.content.documents.some((x) => x.fileId === entity.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.documents.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleComponent.focusOnTitle();
        this.clickDocumentHandler(null);
      } else {
        this.clickDocumentHandler(this.content.documents[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.documents.length > 0) {
      this.clickDocumentHandler(this.content.documents[this.content.documents.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.documents.length === 0) {
      this.titleComponent.focusOnTitle();
      this.clickDocumentHandler(null);
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.documents.findIndex((x) => x.fileId === entity.itemId);
      this.clickDocumentHandler(this.content.documents[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickDocumentHandler(this.content.documents[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleComponent.focusOnTitle();
        this.clickDocumentHandler(null);
      }
    }
  };

  setFocusToEnd = () => {};

  getEditableNative = () => {
    return null;
  };

  getHost() {
    return this.host;
  }

  getContent(): DocumentsCollection {
    return this.content;
  }

  getContentId(): string {
    return this.content.id;
  }

  async exportDocument(document: DocumentModel) {
    await this.exportService.exportDocument(document);
  }

  deleteDocumentHandler(documentId: string) {
    this.deleteDocumentEvent.emit(documentId);
  }

  onTitleChangeInput(name: string) {
    this.content.name = name;
    this.changeTitleEvent.emit(name);
  }

  uploadHandler = () => {
    this.uploadRef.nativeElement.click();
  };

  async exportDocuments(documents: DocumentsCollection) {
    await this.exportService.exportDocuments(documents);
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

  async uploadDocuments(files: File[]) {
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

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
