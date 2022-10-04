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
import { MenuSelectionService } from '../content-editor-services/menu-selection.service';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { SelectionService } from '../content-editor-services/selection.service';
import { BaseText } from '../../models/editor-models/base-text';

@Directive({
  selector: '[appMenuSelection]',
})
export class MenuSelectionDirective implements OnDestroy, OnInit {
  @Input() appMenuSelection: QueryList<ParentInteraction>;

  @Input() isReadonly: boolean;

  listeners = [];

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public apiBrowserService: ApiBrowserTextService,
    public menuSelectionService: MenuSelectionService,
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
      const left = (coords.left + coords.right - 50) / 2;
      const top = coords.top - 50;

      const currentItem = this.getCurrentItem();
      if (currentItem) {
        const textEl = currentItem.getContent() as BaseText;
        const scrollTop = this.elementRef.nativeElement.scrollTop;
        this.menuSelectionService.init(currentItem.getHost(), textEl, top, left, scrollTop);
      }
    } else {
      this.menuSelectionService.cleatItem();
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
