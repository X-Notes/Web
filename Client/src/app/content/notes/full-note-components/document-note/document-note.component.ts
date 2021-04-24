import { Component, Input, OnInit } from '@angular/core';
import { DocumentModel } from '../../models/ContentMode';
import { ParentInteraction } from '../../models/parent-interaction.interface';

@Component({
  selector: 'app-document-note',
  templateUrl: './document-note.component.html',
  styleUrls: ['./document-note.component.scss'],
})
export class DocumentNoteComponent implements OnInit, ParentInteraction {
  @Input()
  content: DocumentModel;

  constructor() {}

  setFocus($event?: any) {}

  setFocusToEnd() {}

  updateHTML(content: string) {}

  getNative() {}

  getContent() {
    return this.content;
  }

  mouseEnter($event: any) {}

  mouseOut($event: any) {}

  ngOnInit(): void {}
}
