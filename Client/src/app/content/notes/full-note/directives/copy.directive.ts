import { Directive, Input, OnDestroy, OnInit, QueryList, Renderer2 } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';
import { Photo } from '../../models/editor-models/photos-collection';
import { ClickableContentService } from '../content-editor-services/clickable-content.service';
import { ContentEditorContentsService } from '../content-editor-services/core/content-editor-contents.service';
import { SelectionService } from '../content-editor-services/selection.service';
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
  customCopy(e): void {
    const isTextCopied = this.copySelectedItemsText();
    if (!isTextCopied) {
      if (this.clickableContentService.isPhoto) {
        const contendId = this.clickableContentService.currentContent.id;
        const itemId = this.clickableContentService.currentItemId;
        const photo = this.contentEditorContentsService.getItem<Photo>(contendId, itemId);
        if (photo) {
          this.apiBrowserFunctions.fetchAndCopyImage(photo.photoFromBig);
        }
      }
    }
  }

  copySelectedItemsText(): boolean {
    const selectedItemsIds = this.selectionService.getSelectedItems();
    if (!selectedItemsIds || selectedItemsIds.length === 0) return false;
    const items = this.contentEditorContentsService.getContents
      .filter(
        (x) =>
          selectedItemsIds.some((z) => z === x.id) &&
          x instanceof BaseText &&
          (x as BaseText).isHaveText(),
      )
      .map((x) => x as BaseText);
    const texts = items.map((item) => item.getConcatedText());
    if (texts.length > 0) {
      const resultText = texts.reduce((pv, cv) => `${pv}\n${cv}`);
      this.apiBrowserFunctions.copyTextAsync(resultText);
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    this.copyListener();
  }
}
