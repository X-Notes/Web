import { Component, Input, OnInit } from '@angular/core';
import { DialogsManageService } from 'src/app/content/navigation/dialogs-manage.service';
import { DocumentModel } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['../styles/inner-card.scss'],
})
export class DocumentNoteComponent implements OnInit, ParentInteraction {
  @Input()
  content: DocumentModel;

  constructor(private dialogsManageService: DialogsManageService) {}

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

  documentIcon() {
    const type = this.content.name.split('.').pop().toLowerCase();
    switch (type) {
      case 'doc':
      case 'docx':
        return 'microsoftWord';
      case 'xls':
      case 'xlsx':
        return 'microsoftExcel';
      case 'ppt':
      case 'pptx':
        return 'microsoftPowerpoint';
      case 'PDF':
        return 'pdf';
      default:
        return 'fileInner';
    }
  }

  openModal() {
    this.dialogsManageService.viewDock(this.content.fileId);
  }

  mouseEnter = ($event: any) => {
    console.log($event);
  };

  mouseOut = ($event: any) => {
    console.log($event);
  };

  ngOnInit = () => {};
}
