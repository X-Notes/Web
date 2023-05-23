import { Component, Input, OnInit } from '@angular/core';
import { DeltaConverter } from '../../full-note/content-editor/converter/delta-converter';
import { BaseText } from '../../models/editor-models/base-text';
import { ThemeENUM } from '../../../../shared/enums/theme.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { ContentModelBase } from '../../models/editor-models/content-model-base';

@Component({
  selector: 'app-note-preview-text',
  templateUrl: './note-preview-text.component.html',
  styleUrls: ['./note-preview-text.component.scss'],
})
export class NotePreviewTextComponent implements OnInit {
  _content: BaseText;

  @Input() set content(value: ContentModelBase) {
    this._content = value as BaseText;
  }

  @Input()
  activeTheme: ThemeENUM = ThemeENUM.Light;

  textType = NoteTextTypeENUM;

  viewHtml: string;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    if (this._content.contents?.length > 0) {
      const html = DeltaConverter.convertTextBlocksToHTML(this._content.contents);
      this.viewHtml = this.sanitizer.bypassSecurityTrustHtml(html) as string;
    }
  }
}
