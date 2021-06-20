import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ApiBrowserTextService } from '../api-browser-text.service';
import { MenuSelectionService } from '../menu-selection.service';
import { BaseText, ContentTypeENUM } from '../models/ContentModel';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { SelectionService } from '../selection.service';

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
      const coords = selection.getRangeAt(0).getBoundingClientRect();
      const left = (coords.left + coords.right) / 2;
      const top = coords.top - 48;

      this.menuSelectionService.menuActive = true;
      this.menuSelectionService.currentItem = this.getCurrentItem();
      this.menuSelectionService.left = left;
      this.menuSelectionService.startTop = top;
      this.menuSelectionService.startScroll = this.elementRef.nativeElement.scrollTop;
    } else {
      this.menuSelectionService.menuActive = false;
      this.menuSelectionService.currentItem = null;
    }
  }

  getCurrentItem(): BaseText {
    for (const item of this.appMenuSelection) {
      const contentItem = item.getContent();
      if (
        contentItem.typeId === ContentTypeENUM.Text &&
        item.getNative() === document.activeElement
      ) {
        return contentItem as BaseText;
      }
    }
    throw new Error('Element was not founded');
  }

  ngOnDestroy(): void {
    for (const destroyFunc of this.listeners) {
      destroyFunc();
    }
  }
}
