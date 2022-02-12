import { Component, Input, OnInit } from '@angular/core';
import { DeltaConverter } from '../../full-note/content-editor/converter/delta-converter';
import { BaseText, NoteTextTypeENUM } from '../../models/editor-models/base-text';

@Component({
  selector: 'app-note-preview-text',
  templateUrl: './note-preview-text.component.html',
  styleUrls: ['./note-preview-text.component.scss'],
})
export class NotePreviewTextComponent implements OnInit {
  @Input()
  content: BaseText;

  textType = NoteTextTypeENUM;

  viewHtml: string;

  ngOnInit(): void {
    const delta = DeltaConverter.convertToDelta(this.content.contents);
    this.viewHtml = DeltaConverter.convertDeltaToHtml(delta);
  }
}
