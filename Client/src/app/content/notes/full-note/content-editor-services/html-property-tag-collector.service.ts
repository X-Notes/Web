import { Injectable } from '@angular/core';
import { ApiBrowserTextService } from '../../api-browser-text.service';
import { BaseText } from '../../models/editor-models/base-text';
import { HeadingTypeENUM } from '../../models/editor-models/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../../models/editor-models/text-models/note-text-type.enum';
import { ParentInteractionHTML } from '../models/parent-interaction.interface';
import { TextEditMenuEnum } from '../text-edit-menu/models/text-edit-menu.enum';

@Injectable()
export class HtmlPropertyTagCollectorService {
  constructor(private apiBrowserService: ApiBrowserTextService) {}

  getIsActiveHeader(heading: HeadingTypeENUM, textItems: BaseText[]): boolean {
    return textItems.some(
      (x) => x && x.noteTextTypeId === NoteTextTypeENUM.heading && x.headingTypeId === heading,
    );
  }

  getIsActiveType(type: NoteTextTypeENUM, textItems: BaseText[]): boolean {
    return textItems.some((x) => type === x.noteTextTypeId);
  }

  getIsBold = (selectedMenuType: TextEditMenuEnum, items: ParentInteractionHTML[]): boolean => {
    return this.isSelectionTags(['strong', 'b'], selectedMenuType, items);
  };

  getIsItalic = (selectedMenuType: TextEditMenuEnum, items: ParentInteractionHTML[]): boolean => {
    return this.isSelectionTags(['em'], selectedMenuType, items);
  };

  isSelectionTags(
    selTags: string[],
    selectedMenuType: TextEditMenuEnum,
    htmlItems: ParentInteractionHTML[],
  ): boolean {
    if (selectedMenuType === TextEditMenuEnum.OneRow) {
      const sel = this.apiBrowserService.getSelection();
      if (!sel) return false;
      const tempDiv = this.getOneRowSelectedHTML(sel);
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

    const rootEl = this.getMultiRowSelectedHTML(htmlItems);
    const properties: { isFounded: boolean } = { isFounded: false };
    this.findTag(rootEl, selTags, properties);
    if (properties.isFounded) {
      return true;
    }

    return false;
  }

  getProperty(
    propertySelector: string,
    selectedMenuType: TextEditMenuEnum,
    htmlItems: ParentInteractionHTML[],
  ): string {
    if (selectedMenuType === TextEditMenuEnum.OneRow) {
      const sel = this.apiBrowserService.getSelection();
      if (!sel) return null;
      const tempDiv = this.getOneRowSelectedHTML(sel);
      if (!tempDiv) return null;
      if (tempDiv.innerHTML === '') return null;
      const res = this.getNodeProperty(sel, tempDiv, propertySelector);
      return res;
    }
    const rootEl = this.getMultiRowSelectedHTML(htmlItems);
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
    for (const subChild of child.childNodes as any as HTMLElement[]) {
      this.findTag(subChild, tags, properties);
    }
  }

  findProperty(child: HTMLElement, propertySelector: string, properties: string[]): void {
    if (child?.style && child?.style[propertySelector]) {
      properties.push(child?.style[propertySelector]);
    }
    for (const subChild of child.childNodes as any as HTMLElement[]) {
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

  getOneRowSelectedHTML = (selection: Selection): HTMLElement => {
    if (!selection) return;
    const container = document.createElement('div');
    for (let i = 0, len = selection.rangeCount; i < len; ++i) {
      container.appendChild(selection.getRangeAt(i).cloneContents());
    }
    return container;
  };

  private getMultiRowSelectedHTML = (htmlItems: ParentInteractionHTML[]): HTMLElement => {
    const container = document.createElement('div');
    for (const el of htmlItems.map((x) => x.getEditableNative())) {
      if (el) {
        container.appendChild(el.cloneNode(true));
      }
    }
    return container;
  };
}
