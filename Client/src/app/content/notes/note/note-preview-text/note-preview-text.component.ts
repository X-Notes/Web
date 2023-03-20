import { Component, Input, OnInit } from '@angular/core';
import { DeltaConverter } from '../../full-note/content-editor/converter/delta-converter';
import { BaseText } from '../../models/editor-models/base-text';
import { ThemeENUM } from '../../../../shared/enums/theme.enum';
import { DomSanitizer } from '@angular/platform-browser';
import { NoteTextTypeENUM } from '../../full-note/content-editor/text/note-text-type.enum';

@Component({
  selector: 'app-note-preview-text',
  templateUrl: './note-preview-text.component.html',
  styleUrls: ['./note-preview-text.component.scss'],
})
export class NotePreviewTextComponent implements OnInit {
  @Input()
  content: BaseText;

  @Input()
  activeTheme: ThemeENUM = ThemeENUM.Light;

  textType = NoteTextTypeENUM;

  viewHtml: string;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const contentsUI = this.content.contents?.map((x) => x.getProjection());
    if (contentsUI?.length > 0) {
      const html = DeltaConverter.convertTextBlocksToHTML(contentsUI);
      this.viewHtml = this.sanitizer.bypassSecurityTrustHtml(html) as string;
    }
  }
}
