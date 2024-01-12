import { Injectable } from '@angular/core';
import { HeadingTypeENUM } from '../entities/contents/text-models/heading-type.enum';
import { NoteTextTypeENUM } from '../entities/contents/text-models/note-text-type.enum';
import { ParentInteractionHTML } from '../components/parent-interaction.interface';
import { ApiBrowserTextService } from 'src/app/content/notes/api-browser-text.service';
import { BaseText } from '../entities/contents/base-text';

@Injectable()
export class HtmlPropertyTagCollectorService {
  constructor(private apiBrowserService: ApiBrowserTextService) { }

  getIsActiveHeader(heading: HeadingTypeENUM, textItems: BaseText[]): boolean {
    return textItems.some(
      (x) => x && x.metadata?.noteTextTypeId === NoteTextTypeENUM.heading && x.metadata?.hTypeId === heading,
    );
  }

  getIsActiveType(type: NoteTextTypeENUM, textItems: BaseText[]): boolean {
    return textItems.some((x) => type === x.metadata.noteTextTypeId);
  }

  getIsBoldSelection = (): boolean => {
    return this.isSelectionTagsSelection(['strong', 'b']);
  };

  getIsBold = (items: ParentInteractionHTML[]): boolean => {
    return this.isSelectionTags(['strong', 'b'], items);
  };

  getIsItalicSelection = (): boolean => {
    return this.isSelectionTagsSelection(['em']);
  };

  getIsItalic = (items: ParentInteractionHTML[]): boolean => {
    return this.isSelectionTags(['em'], items);
  };

  isSelectionTagsSelection(selTags: string[]): boolean {
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

  isSelectionTags(
    selTags: string[],
    htmlItems: ParentInteractionHTML[],
  ): boolean {

    const rootEl = this.getMultiRowSelectedHTML(htmlItems);
    const properties: { isFounded: boolean } = { isFounded: false };
    this.findTag(rootEl, selTags, properties);
    if (properties.isFounded) {
      return true;
    }

    return false;
  }

  getPropertySelection(propertySelector: string): string {
    const sel = this.apiBrowserService.getSelection();
    if (!sel) return null;
    const tempDiv = this.getOneRowSelectedHTML(sel);
    if (!tempDiv) return null;
    if (tempDiv.innerHTML === '') return null;
    const res = this.getNodeProperty(sel, tempDiv, propertySelector);
    return res;
  }

  getLink(): string {
    const sel = this.apiBrowserService.getSelection();
    if (!sel) return null;
    const tempDiv = this.getOneRowSelectedHTML(sel);
    if (!tempDiv) return null;
    if (tempDiv.innerHTML === '') return null;
    return this.getLinkOfNode(sel, tempDiv);
  }

  getProperty(propertySelector: string, htmlItems: ParentInteractionHTML[],
  ): string {
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

  getNodeProperty(sel: Selection, el: HTMLElement, stylePropertySelector: string): string {
    const children = el.childNodes as any as HTMLElement[];
    for (const child of children) {
      if (child.style && child.style[stylePropertySelector]) {
        return child.style[stylePropertySelector];
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

        if (endParent?.style && endParent?.style[stylePropertySelector]) {
          return endParent?.style[stylePropertySelector];
        }
        if (startParent?.style && startParent?.style[stylePropertySelector]) {
          return startParent?.style[stylePropertySelector];
        }
        if (startTagParent?.style && startTagParent?.style[stylePropertySelector]) {
          return startTagParent?.style[stylePropertySelector];
        }
        if (endTagParent?.style && endTagParent?.style[stylePropertySelector]) {
          return endTagParent?.style[stylePropertySelector];
        }
      }
      this.getNodeProperty(sel, child, stylePropertySelector);
    }

    return null;
  }

  private getLinkOfNode(sel: Selection, el: HTMLElement): string {
    const children = el.childNodes as any as HTMLElement[];
    for (const child of children) {
      if (child.tagName === 'A' && child.attributes.getNamedItem('href')) {
        const link = child.attributes.getNamedItem('href');
        return link.value;
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

        if (endParent.tagName === 'A' && endParent.attributes.getNamedItem('href')) {
          const link = endParent.attributes.getNamedItem('href');
          return link.value;
        }
        if (startParent.tagName === 'A' && startParent.attributes.getNamedItem('href')) {
          const link = startParent.attributes.getNamedItem('href');
          return link.value;
        }
        if (startTagParent.tagName === 'A' && startTagParent.attributes.getNamedItem('href')) {
          const link = startTagParent.attributes.getNamedItem('href');
          return link.value;
        }
        if (endTagParent.tagName === 'A' && endTagParent.attributes.getNamedItem('href')) {
          const link = endTagParent.attributes.getNamedItem('href');
          return link.value;
        }
      }
      this.getLinkOfNode(sel, child);
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
