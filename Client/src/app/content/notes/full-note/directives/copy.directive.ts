import { Directive, Input, OnDestroy, OnInit, QueryList, Renderer2 } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { Photo } from '../../models/editor-models/photos-collection';
import { ClickableContentService } from '../content-editor-services/clickable-content.service';
import { ContentEditorContentsService } from '../content-editor-services/core/content-editor-contents.service';
import { SelectionService } from '../content-editor-services/selection.service';
import { HeadingTypeENUM } from '../content-editor/text/heading-type.enum';
import { NoteTextTypeENUM } from '../content-editor/text/note-text-type.enum';
import { ParentInteraction } from '../models/parent-interaction.interface';

@Directive({
  selector: '[appCopy]',
})
export class CopyDirective implements OnDestroy, OnInit {
  @Input() appCopy: QueryList<ParentInteraction>;

  copyListener;

  constructor(
    private renderer: Renderer2,
    private apiBrowserFunctions: ApiBrowserTextService,
    private selectionService: SelectionService,
    private contentEditorContentsService: ContentEditorContentsService,
    private clickableContentService: ClickableContentService,
  ) {}

  ngOnInit(): void {
    this.copyListener = this.renderer.listen('body', 'copy', (e) => this.customCopy(e));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customCopy(e: ClipboardEvent): void {
    if (this.clickableContentService.isPhoto) {
      const contendId = this.clickableContentService.currentContent.id;
      const itemId = this.clickableContentService.currentItemId;
      const photo = this.contentEditorContentsService.getItem<Photo>(contendId, itemId);
      if (photo) {
        this.apiBrowserFunctions.fetchAndCopyImage(photo.photoFromBig);
      }
      return;
    }
    const selectedItemsIds = this.selectionService.getSelectedItems();
    if (selectedItemsIds.length > 0) {
      e.preventDefault();
      const html = this.getHTMLContents(selectedItemsIds);
      const text = this.getTextContents(selectedItemsIds);
      e.clipboardData.setData('text/plain', text);
      e.clipboardData.setData('text/html', html);
    }
  }

  getHTMLContents(selectedItemsIds: string[]): string {
    let elements = this.appCopy.toArray();
    elements = elements.filter((x) => selectedItemsIds.some((q) => q === x.getContentId()));
    const htmls = elements.map((x) => this.processRawHTML(x)).filter((x) => x);
    if (htmls.length > 0) {
      return htmls.reduce((pv, cv) => `${pv}\n${cv}`);
    }
    return '';
  }

  processRawHTML(content: ParentInteraction): string {
    const typeId = content.getContent().typeId;
    if (typeId !== ContentTypeENUM.Text) return;
    const text = content.getContent() as BaseText;
    if (text.noteTextTypeId === NoteTextTypeENUM.heading) {
      const headingNumber = this.getHeadingNumber(text.headingTypeId);
      const childHTML = content.getEditableNative().innerHTML;
      return `<h${headingNumber}>${childHTML}</h${headingNumber}>`;
    }
    if (text.noteTextTypeId === NoteTextTypeENUM.dotList) {
      const childHTML = content.getEditableNative().innerHTML;
      return `<ul><li>${childHTML}</li></ul>`;
    }
    if (text.noteTextTypeId === NoteTextTypeENUM.numberList) {
      const childHTML = content.getEditableNative().innerHTML;
      return `<ol><li>${childHTML}</li></ol>`;
    }
    if (text.noteTextTypeId === NoteTextTypeENUM.checkList) {
      const child = content.getEditableNative().cloneNode(true) as HTMLElement;
      child.textContent = '[ ]' + child.textContent;
      return `<ul><li>${child.innerHTML}</li></ul>`;
    }

    return content.getEditableNative().outerHTML;
  }

  getHeadingNumber(heading: HeadingTypeENUM): number {
    if (heading === HeadingTypeENUM.H2) {
      return 3;
    }
    if (heading === HeadingTypeENUM.H3) {
      return 5;
    }
    return 1;
  }

  getTextContents(selectedItemsIds: string[]): string {
    const items = this.contentEditorContentsService.getContents
      .filter(
        (x) =>
          selectedItemsIds.some((q) => q === x.id) &&
          x instanceof BaseText &&
          (x as BaseText).isHaveUIText(),
      )
      .map((x) => x as BaseText);
    const texts = items.map((item) => item.getUIConcatedText());
    if (texts.length > 0) {
      return texts.reduce((pv, cv) => `${pv}\n${cv}`);
    }
    return '';
  }

  ngOnDestroy(): void {
    this.copyListener();
  }
}
