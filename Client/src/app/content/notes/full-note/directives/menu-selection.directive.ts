import { Directive, Input, OnDestroy, OnInit, QueryList, Renderer2 } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { SelectionService } from '../content-editor-services/selection.service';

@Directive({
  selector: '[appMenuSelection]',
})
export class MenuSelectionDirective implements OnDestroy, OnInit {
  @Input() appMenuSelection: QueryList<ParentInteraction>;

  @Input() isReadonly: boolean;

  @Input() scrollElement: HTMLElement;

  listeners = [];

  constructor(
    private renderer: Renderer2,
    public apiBrowserService: ApiBrowserTextService,
    public selectionService: SelectionService,
  ) {}

  ngOnInit(): void {
    if (!this.isReadonly) {
      const mouseupListener = this.renderer.listen(document, 'selectionchange', () =>
        this.onSelectionchange(),
      );
      this.listeners.push(mouseupListener);
    }
  }

  onSelectionchange() {
    const selection = this.apiBrowserService.getSelection();
    if (selection.toString() !== '') {
      const range = selection.getRangeAt(0);
      const coords = range.getBoundingClientRect();
      const currentItem = this.getCurrentItem();
      if (currentItem) {
        this.selectionService.initSingle(currentItem.getContentId(), this.scrollElement, coords);
      }
    }
  }

  getCurrentItem(): ParentInteraction {
    for (const item of this.appMenuSelection) {
      const contentItem = item.getContent();
      if (
        contentItem.typeId === ContentTypeENUM.Text &&
        item.getEditableNative() === document.activeElement
      ) {
        return item;
      }
    }
    return null;
  }

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
