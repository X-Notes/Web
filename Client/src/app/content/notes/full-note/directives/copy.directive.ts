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
import { BaseText } from '../../models/content-model.model';
import { ContentEditorContentsService } from '../content-editor-services/content-editor-contents.service';
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
    private contentEditorContentsService: ContentEditorContentsService,) {}

  ngOnInit(): void {
    this.copyListener = this.renderer.listen('body', 'copy', (e) => this.customCopy(e));
  }

  customCopy(e) {
    const selectedItemsIds = this.selectionService.getSelectedItems();
    const items = this.contentEditorContentsService.getContents
                    .filter(x => selectedItemsIds.some(z => z === x.id) && x instanceof BaseText)
                    .map(x => x as BaseText);
    const texts = items.map((item) => item.content);
    if (texts.length > 0) {
      const resultText = texts.reduce((pv, cv) => `${pv}\n${cv}`);
      this.apiBrowserFunctions.copyTest(resultText);
    }
  }

  ngOnDestroy(): void {
    this.copyListener();
  }
}
