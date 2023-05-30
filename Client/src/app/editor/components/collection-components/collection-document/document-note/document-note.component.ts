import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
} from '@angular/core';
import { ExportService } from 'src/app/content/notes/export.service';
import { ClickableSelectableEntities } from 'src/app/editor/entities-ui/clickable-selectable-entities.enum';
import { TypeUploadFormats } from 'src/app/editor/entities-ui/files-enums/type-upload-formats.enum';
import { SetFocus, FocusDirection } from 'src/app/editor/entities-ui/set-focus';
import { DocumentsCollection, DocumentModel } from 'src/app/editor/entities/contents/documents-collection';
import { HtmlComponentsFacadeService } from '../../../html-components.facade.service';
import { ParentInteractionCollection } from '../../../parent-interaction.interface';
import { CollectionBaseComponent } from '../../collection.base.component';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['./document-note.component.scss', '../../../../../../styles/innerNote.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentNoteComponent
  extends CollectionBaseComponent<DocumentsCollection>
  implements OnInit, ParentInteractionCollection
{
  formats = TypeUploadFormats.documents;

  constructor(
    private exportService: ExportService,
    private host: ElementRef,
    cdr: ChangeDetectorRef,
    facade: HtmlComponentsFacadeService,
  ) {
    super(cdr, ClickableSelectableEntities.Document, facade);
  }

  get isClicked() {
    return this.facade.clickableService.isClicked(this.getFirst?.fileId);
  }

  get getFirst(): DocumentModel {
    if (this.content.items && this.content.items.length > 0) {
      return this.content.items[0];
    }
    return null;
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
    entity.event.preventDefault();

    const isExist = this.content.items.some((x) => x.fileId === entity.itemId);
    if (entity.status === FocusDirection.Up && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      if (index === 0) {
        this.scrollAndFocusToTitle();
      } else {
        this.clickItemHandler(this.content.items[index - 1].fileId);
        (document.activeElement as HTMLInputElement).blur();
      }
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length > 0) {
      this.clickItemHandler(this.content.items[this.content.items.length - 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Up && this.content.items.length === 0) {
      this.scrollAndFocusToTitle();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down && isExist) {
      const index = this.content.items.findIndex((x) => x.fileId === entity.itemId);
      this.clickItemHandler(this.content.items[index + 1].fileId);
      (document.activeElement as HTMLInputElement).blur();
      this.cdr.detectChanges();
      return;
    }

    if (entity.status === FocusDirection.Down) {
      if (this.titleComponent.isFocusedOnTitle) {
        // eslint-disable-next-line prefer-destructuring
        this.clickItemHandler(this.content.items[0].fileId);
        (document.activeElement as HTMLInputElement).blur();
      } else {
        this.scrollAndFocusToTitle();
      }
      this.cdr.detectChanges();
      return;
    }
  };

  setFocusToEnd = () => {};

  getHost() {
    return this.host;
  }

  async exportDocument(document: DocumentModel) {
    await this.exportService.exportDocument(document);
  }

  async exportDocuments(documents: DocumentsCollection) {
    await this.exportService.exportDocuments(documents);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseEnter = ($event: any) => {
    this.isMouseOver = true;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mouseLeave = ($event: any) => {
    this.isMouseOver = false;
  };

  ngOnInit() {}

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
