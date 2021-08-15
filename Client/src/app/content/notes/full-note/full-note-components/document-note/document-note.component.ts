import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { ExportService } from '../../../export.service';
import { DocumentModel } from '../../../models/content-model.model';
import { docFormats, excelFormats, pdfFormats, presentationFormats } from '../../models/enums/type-upload-formats.enum';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['../styles/inner-card.scss'],
})
export class DocumentNoteComponent implements OnInit, ParentInteraction {
  @Input()
  content: DocumentModel;

  @Input()
  isReadOnlyMode = false;

  @Output() deleteDocumentEvent = new EventEmitter<string>();

  constructor(
    private dialogsManageService: DialogsManageService,
    private exportService: ExportService,
  ) {}

  setFocus = ($event?: any) => {
    console.log($event);
  };

  setFocusToEnd = () => {};

  updateHTML = (content: string) => {
    console.log(content);
  };

  getNative = () => {};

  getContent() {
    return this.content;
  }

  async exportDocument() {
    await this.exportService.exportDocument(this.content);
  }

  documentIcon() {
    const type = this.content.name.split('.').pop().toLowerCase();

    if(docFormats.some(format =>  format === type)){
      return 'microsoftWord';
    }

    if(excelFormats.some(format => format === type)){
      return 'microsoftExcel';
    }

    if(presentationFormats.some(format => format === type)){
      return 'microsoftPowerpoint';
    }

    if(pdfFormats.some(format => format === type)){
      return 'pdf';
    }

    return 'fileInner';
  }

  openModal() {
    const path = this.exportService.getPath(this.content.documentPath, this.content.authorId);
    console.log(path);
    this.dialogsManageService.viewDock(path);
  }

  mouseEnter = ($event: any) => {
    console.log($event);
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };

  ngOnInit = () => {};
}
