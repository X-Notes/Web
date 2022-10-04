import { Component, EventEmitter, Input, Output, QueryList, ViewChild } from '@angular/core';
import { TextBackgroundColors } from 'src/app/shared/enums/text-background-colors.enum';
import { TextColors } from 'src/app/shared/enums/text-colors.enum';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { TextStyles, TextUpdateValue, UpdateTextStyles } from '../../models/update-text-styles';
import { MenuSelectionService } from '../content-editor-services/menu-selection.service';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { TransformContent } from '../models/transform-content.model';
import { TextEditMenuEnum } from './models/text-edit-menu.enum';

@Component({
  selector: 'app-text-edit-menu',
  templateUrl: './text-edit-menu.component.html',
  styleUrls: ['./text-edit-menu.component.scss'],
})
export class TextEditMenuComponent {
  @Output()
  eventTransform = new EventEmitter<TransformContent>();

  @Output()
  updateText = new EventEmitter<UpdateTextStyles>();

  @Input()
  selectedMenuType: TextEditMenuEnum;

  @Input()
  elements: QueryList<ParentInteraction>;

  menuType = TextEditMenuEnum;

  textType = NoteTextTypeENUM;

  headingType = HeadingTypeENUM;

  textColorPalete = Object.entries(TextColors);

  textBackgroundPalete = Object.entries(TextBackgroundColors);

  constructor(
    public menuSelectionService: MenuSelectionService,
    private apiBrowserService: ApiBrowserTextService,
  ) {}

  preventUnSelection = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  transformContent(e, type: NoteTextTypeENUM, heading?: HeadingTypeENUM): void {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) return;
    if (item.noteTextTypeId === type && item.headingTypeId === heading) {
      this.eventTransform.emit({
        id: item.id,
        textType: NoteTextTypeENUM.Default,
        setFocusToEnd: true,
      });
    } else {
      const textType = type === item.noteTextTypeId ? NoteTextTypeENUM.Default : type;
      this.eventTransform.emit({
        id: item.id,
        textType,
        headingType: heading,
        setFocusToEnd: true,
      });
    }
    this.menuSelectionService.clearItemAndSelection();
  }

  setBoldStyle($event): void {
    $event.preventDefault();
    this.updateStyles('bold', this.getIsBold() ? false : true);
  }

  setItalicStyle($event) {
    $event.preventDefault();
    this.updateStyles('italic', this.getIsItalic() ? false : true);
  }

  setTextColor($event, value: string = null) {
    console.log('setTextColor');
    $event.preventDefault();
    this.updateStyles('color', value);
  }

  setBackground($event, value: string = null) {
    console.log('setBackground');
    $event.preventDefault();
    this.updateStyles('background', value);
  }

  updateStyles(textStyle: TextStyles, value: TextUpdateValue): void {
    let isRemoveStyles = false;
    if (value === TextColors.Default || value === TextBackgroundColors.Default) {
      value = null;
      isRemoveStyles = true;
    }
    this.updateText.emit({
      textStyle,
      value,
      isRemoveStyles,
    });
    this.menuSelectionService.clearItemAndSelection();
  }

  getIsActiveHeader(heading: HeadingTypeENUM): boolean {
    const item = this.menuSelectionService.currentTextItem;
    if (
      item &&
      item.noteTextTypeId === NoteTextTypeENUM.Heading &&
      item.headingTypeId === heading
    ) {
      return true;
    }
    return false;
  }

  getIsActiveType(type: NoteTextTypeENUM): boolean {
    const item = this.menuSelectionService.currentTextItem;
    if (!item) return false;
    return type === item.noteTextTypeId;
  }

  getIsBold = (): boolean => {
    return this.isSelectionTags(['strong', 'b']);
  };

  getIsItalic = (): boolean => {
    return this.isSelectionTags(['em']);
  };

  isSelectionTags(selTags: string[]): boolean {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      const sel = this.apiBrowserService.getSelection();
      if (!sel) return false;
      const tempDiv = this.getOneRowSelectedHTML();
      if (!tempDiv) return false;
      if (tempDiv.innerHTML === '' || !tempDiv.childNodes) return false;
      const tagsSet = new Set<string>();
      for (const node of tempDiv.childNodes as any) {
        let tags = [node.nodeName.toLowerCase()];
        tagsSet.add(node.nodeName.toLowerCase());

        // This covers selection that are inside bolded characters
        while (tags.includes('#text')) {
          const startParent = sel.anchorNode.parentNode;
          const endParent = sel.focusNode.parentNode;

          const startTag = startParent.nodeName.toLowerCase();
          const endTag = endParent.nodeName.toLowerCase();

          const startTagParent = startParent.parentElement.nodeName.toLowerCase();
          const endTagParent = endParent.parentElement.nodeName.toLowerCase();

          tags = [startTag, endTag];
          tagsSet.add(startTag);
          tagsSet.add(endTag);
          tagsSet.add(startTagParent);
          tagsSet.add(endTagParent);
        }
      }
      return selTags.some((x) => tagsSet.has(x));
    }

    const rootEl = this.getMultiRowSelectedHTML();
    const properties: { isFounded: boolean } = { isFounded: false };
    this.findTag(rootEl, selTags, properties);
    if (properties.isFounded) {
      return true;
    }

    return false;
  }

  getProperty(propertySelector: string): string {
    if (this.selectedMenuType === TextEditMenuEnum.OneRow) {
      const sel = this.apiBrowserService.getSelection();
      if (!sel) return null;
      const tempDiv = this.getOneRowSelectedHTML();
      if (!tempDiv) return null;
      if (tempDiv.innerHTML === '') return null;
      const res = this.getNodeProperty(sel, tempDiv, propertySelector);
      return res;
    }
    const rootEl = this.getMultiRowSelectedHTML();
    const properties: string[] = [];
    this.findProperty(rootEl, propertySelector, properties);
    if (properties?.length > 0) {
      return properties[0];
    }
    return null;
  }

  findTag(child: HTMLElement, tags: string[], properties: { isFounded: boolean }): void {
    if (tags.some((x) => x === child?.nodeName.toLowerCase())) {
      properties.isFounded = true;
    }
    for (let subChild of child.childNodes as any as HTMLElement[]) {
      this.findTag(subChild, tags, properties);
    }
  }

  findProperty(child: HTMLElement, propertySelector: string, properties: string[]): void {
    if (child?.style && child?.style[propertySelector]) {
      properties.push(child?.style[propertySelector]);
    }
    for (let subChild of child.childNodes as any as HTMLElement[]) {
      this.findProperty(subChild, propertySelector, properties);
    }
  }

  getNodeProperty(sel: Selection, el: HTMLElement, propertySelector: string): string {
    const children = el.childNodes as any as HTMLElement[];
    for (const child of children) {
      if (child.style && child.style[propertySelector]) {
        return child.style[propertySelector];
      }
      let tags = [child.nodeName.toLowerCase()];
      while (tags.includes('#text')) {
        const startParent = sel.anchorNode.parentNode as HTMLElement;
        const endParent = sel.focusNode.parentNode as HTMLElement;

        const startTag = startParent.nodeName.toLowerCase();
        const endTag = endParent.nodeName.toLowerCase();

        const startTagParent = startParent.parentElement as HTMLElement;
        const endTagParent = endParent.parentElement as HTMLElement;

        tags = [startTag, endTag];

        if (endParent?.style && endParent?.style[propertySelector]) {
          return endParent?.style[propertySelector];
        }
        if (startParent?.style && startParent?.style[propertySelector]) {
          return startParent?.style[propertySelector];
        }
        if (startTagParent?.style && startTagParent?.style[propertySelector]) {
          return startTagParent?.style[propertySelector];
        }
        if (endTagParent?.style && endTagParent?.style[propertySelector]) {
          return endTagParent?.style[propertySelector];
        }
      }
      this.getNodeProperty(sel, child, propertySelector);
    }

    return null;
  }

  getOneRowSelectedHTML = (): HTMLElement => {
    const selection = this.apiBrowserService.getSelection();
    if (!selection) return;
    const container = document.createElement('div');
    for (let i = 0, len = selection.rangeCount; i < len; ++i) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    return container;
  };

  getMultiRowSelectedHTML = (): HTMLElement => {
    const container = document.createElement('div');
    for (let el of this.elements.map((x) => x.getEditableNative())) {
      container.appendChild(el.cloneNode(true));
    }
    return container;
  };
}
