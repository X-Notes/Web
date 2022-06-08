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

  listeners = [];

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    public apiBrowserService: ApiBrowserTextService,
    public menuSelectionService: MenuSelectionService,
    public selectionService: SelectionService,
  ) {}

  ngOnInit(): void {
    const mouseupListener = this.renderer.listen(document, 'mouseup', () => this.mouseUp());
    this.listeners.push(mouseupListener);
  }

  mouseUp() {
    const selection = this.apiBrowserService.getSelection();
    if (selection.toString() !== '') {
      const range = selection.getRangeAt(0);
      const coords = range.getBoundingClientRect();
      const deltaSide = this.selectionService.sidebarWidth * 2;
      const deltaMenuWidth = 100;
      const left = (coords.left + coords.right - deltaSide - deltaMenuWidth) / 2;
      const top = coords.top - 100;

      this.menuSelectionService.currentTextItem = this.getCurrentItem().getContent() as BaseText;
      this.menuSelectionService.currentSelection = selection;

      this.menuSelectionService.left = left;
      this.menuSelectionService.startTop = top;
      this.menuSelectionService.startScroll = this.elementRef.nativeElement.scrollTop;
    } else {
      this.menuSelectionService.currentTextItem = null;
      this.menuSelectionService.currentSelection = null;
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
  }

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
