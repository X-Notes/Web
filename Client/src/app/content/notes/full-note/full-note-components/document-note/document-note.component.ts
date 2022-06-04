import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ExportService } from '../../../export.service';
import { ParentInteraction } from '../../models/parent-interaction.interface';
import { ClickableContentService } from '../../content-editor-services/clickable-content.service';
import { FocusDirection, SetFocus } from '../../models/set-focus';
import { CollectionService } from '../collection-services/collection.service';
import { ClickableSelectableEntities } from '../../content-editor-services/models/clickable-selectable-entities.enum';
import { TypeUploadFormats } from '../../models/enums/type-upload-formats.enum';
import {
  DocumentModel,
  DocumentsCollection,
} from '../../../models/editor-models/documents-collection';
import { ApiBrowserTextService } from '../../../api-browser-text.service';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['./document-note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentNoteComponent
  extends CollectionService<DocumentsCollection>
  implements OnInit, ParentInteraction
{
  @ViewChild('uploadRef') uploadRef: ElementRef;

  formats = TypeUploadFormats.documents;

  constructor(
    private exportService: ExportService,
    private host: ElementRef,
    private clickableService: ClickableContentService,
    cdr: ChangeDetectorRef,
    clickableContentService: ClickableContentService,
    apiBrowserTextService: ApiBrowserTextService,
  ) {
    super(cdr, clickableContentService, apiBrowserTextService);
  }

  get isClicked() {
    return this.clickableService.isClicked(this.getFirst?.fileId);
  }

  get getFirst(): DocumentModel {
    if (this.content.items && this.content.items.length > 0) {
      return this.content.items[0];
    }
    return null;
  }

  get isEmpty(): boolean {
    if (!this.content.items || this.content.items.length === 0) {
      return true;
    }
    return false;
  }

  clickDocumentHandler(documentId: string) {
    this.clickableService.set(ClickableSelectableEntities.Document, documentId, this.content.id);
  }

  isFocusToNext(entity: SetFocus) {
    if (entity.status === FocusDirection.Up && this.titleComponent.isFocusedOnTitle) {
      return true;
    }
    if (entity.status === FocusDirection.Down) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      return index === this.content.items.length - 1;
    }
    return false;
  }

  setFocus = (entity?: SetFocus) => {
    const isExist = this.content.items.some((x) => x.fileId === entity.itemId);

    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.titleComponent.focusOnTitle();
        this.clickDocumentHandler(null);
      } else {
        this.clickDocumentHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickDocumentHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.titleComponent.focusOnTitle();
      this.clickDocumentHandler(null);
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickDocumentHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickDocumentHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.titleComponent.focusOnTitle();
        this.clickDocumentHandler(null);
      }
      this.cdr.detectChanges();
      return;
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

  uploadHandler = () => {
    this.uploadRef.nativeElement.click();
  };

  async exportDocuments(documents: DocumentsCollection) {
    await this.exportService.exportDocuments(documents);
  }

  async uploadDocuments(files: File[]) {
    if (files?.length > 0) {
      this.uploadEvent.emit({ contentId: this.content.id, files: [...files] });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

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
}
