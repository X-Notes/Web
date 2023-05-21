import { Directive, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { Photo } from '../../models/editor-models/photos-collection';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { ClickableContentService } from '../content-editor-services/clickable-content.service';
import { ContentEditorContentsService } from '../content-editor-services/core/content-editor-contents.service';
import { SelectionService } from '../content-editor-services/selection.service';
import { ParentInteractionHTML } from '../models/parent-interaction.interface';
import { ofActionDispatched } from '@ngxs/store';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { takeUntil } from 'rxjs/operators';
import { CopyNoteText } from 'src/app/content/navigation/menu/actions/copy-note-text-action';
import { SnackbarService } from 'src/app/shared/services/snackbar/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Directive({
  selector: '[appCopy]',
})
export class CopyDirective implements OnDestroy, OnInit {
  @Input() appCopy: ParentInteractionHTML[];

  copyListener;

  constructor(
    private renderer: Renderer2,
    private apiBrowserFunctions: ApiBrowserTextService,
    private selectionService: SelectionService,
    private contentEditorContentsService: ContentEditorContentsService,
    private clickableContentService: ClickableContentService,
    private facade: EditorFacadeService,
    private snackbarService: SnackbarService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.copyListener = this.renderer.listen('body', 'copy', (e) => this.customCopy(e));
    this.facade.actions$
      .pipe(ofActionDispatched(CopyNoteText), takeUntil(this.facade.dc.d$))
      .subscribe(() => this.copyAllTextsItems());
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

  async copyAllTextsItems() {
    // const html = this.processHTMLContents(this.appCopy);
    const text = this.processTextContents(this.contentEditorContentsService.getTextContents);
    //await this.apiBrowserFunctions.copyHTMLAsync(html);
    await this.apiBrowserFunctions.copyTextAsync(text);
    this.snackbarService.openSnackBar(this.translate.instant('snackBar.copied'));
  }

  getHTMLContents(selectedItemsIds: string[]): string {
    let elements = this.appCopy;
    elements = elements.filter((x) => selectedItemsIds.some((q) => q === x.getContentId()));
    return this.processHTMLContents(elements);
  }

  processHTMLContents(elements: ParentInteractionHTML[]): string {
    const htmls = elements.map((x) => this.processRawHTML(x)).filter((x) => x);
    if (htmls.length > 0) {
      return htmls.reduce((pv, cv) => `${pv}\n${cv}`);
    }
    return '';
  }

  processRawHTML(content: ParentInteractionHTML): string {
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
    const items = this.contentEditorContentsService.getTextContents.filter((x) =>
      selectedItemsIds.some((q) => q === x.id),
    );
    return this.processTextContents(items);
  }

  processTextContents(inputTxts: BaseText[]): string {
    const tmpTexts = inputTxts.filter((x) => x.isHaveText());
    const texts = tmpTexts.map((item) => item.getConcatedText());
    if (texts.length > 0) {
      return texts.reduce((pv, cv) => `${pv}\n${cv}`);
    }
    return '';
  }

  ngOnDestroy(): void {
    this.copyListener();
  }
}
