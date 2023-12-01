import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DeltaConverter } from 'src/app/editor/converter/delta-converter';
import { BaseText } from 'src/app/editor/entities/contents/base-text';
import { ContentModelBase } from 'src/app/editor/entities/contents/content-model-base';
import { NoteTextTypeENUM } from 'src/app/editor/entities/contents/text-models/note-text-type.enum';
import { ThemeENUM } from 'src/app/shared/enums/theme.enum';

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

  @Input()
  listNumber: number;
  
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
