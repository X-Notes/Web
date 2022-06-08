import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';
import { ContentEditorContentsSynchronizeService } from '../content-editor-services/content-editor-contents.service';
import { SelectionService } from '../content-editor-services/selection.service';

@Directive({
  selector: '[appCopy]',
})
export class CopyDirective implements OnDestroy, OnInit {
  @Input() appCopy: QueryList<ElementRef>;

  copyListener;

  constructor(
    private renderer: Renderer2,
    private apiBrowserFunctions: ApiBrowserTextService,
    private selectionService: SelectionService,
    private contentEditorContentsService: ContentEditorContentsSynchronizeService,
  ) {}

  ngOnInit(): void {
    this.copyListener = this.renderer.listen('body', 'copy', (e) => this.customCopy(e));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  customCopy(e) {
    const selectedItemsIds = this.selectionService.getSelectedItems();
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
      this.apiBrowserFunctions.copyTest(resultText);
    }
  }

  ngOnDestroy(): void {
    this.copyListener();
  }
}
