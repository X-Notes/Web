import Quill, { DeltaStatic } from 'quill';
import { TextBlock } from '../entities/contents/text-models/text-block';
import { TextType } from '../entities/contents/text-models/text-type';
import { TextUpdateValue } from '../entities-ui/text-edit-menu/update-texts-styles';
import { DeltaListEnum } from './entities/delta-list.enum';

export interface StringAny {
  [key: string]: any;
}

export class DeltaConverter {
  static quillInstance: Quill;

  static get getFormated(): DeltaStatic {
    return DeltaConverter.quillInstance.getContents();
  }

  static initQuill() {
    const id = 'hidden-text-editor';
    const quillDIV = document.createElement('div');
    quillDIV.style.display = 'none';
    quillDIV.style.position = 'absolute';
    quillDIV.style.left = '-999999px';
    quillDIV.id = id;
    document.body.appendChild(quillDIV);
    DeltaConverter.quillInstance = new Quill(`#${id}`);
  }

  // CONVERT METHODS

  static convertHTMLToTextBlocks(html: string): TextBlock[] {
    const delta = this.convertHTMLToDelta(html);
    return this.convertDeltaToTextBlocks(delta);
  }

  static convertDeltaToTextBlocks(delta: DeltaStatic): TextBlock[] {
    if (!delta.ops || delta.ops.length === 0) {
      return [];
    }
    const result: TextBlock[] = [];
    delta.ops.forEach((item) => {
      const block = new TextBlock({});
      if (typeof item.insert !== 'string') return; // Todo there are can be paste image
      const clearStr = item.insert?.replace(/[\r\n]+/g, '');
      if (clearStr) {
        block.t = clearStr;
        block.tt = this.getTextTypes(item.attributes);
        block.tc = this.getTextColor(item.attributes);
        block.l = this.getLink(item.attributes);
        block.hc = this.getHighlightColorColor(item.attributes);
        // UI fields
        block.list = this.getList(item.attributes);
        block.header = this.getHeader(item.attributes);
        result.push(block);
      }
    });
    return result;
  }

  static convertTextBlocksToHTML(contents: TextBlock[]): string {
    if(!contents) return null;
    const ops = this.convertTextBlocksToDelta(contents);
    const html = this.convertDeltaToHtml(ops);
    return html;
  }

  static convertDeltaToHtml = (deltaStatic: DeltaStatic): string => {
    if (!deltaStatic?.ops || deltaStatic?.ops?.length === 0) {
      return null;
    }

    DeltaConverter.quillInstance.setContents(deltaStatic);
    const result = DeltaConverter.quillInstance.root.innerHTML;
    DeltaConverter.quillInstance.setContents(null);
    return result;
  };

  static setStyles(
    html: string,
    index: number,
    length: number,
    format: string,
    value: TextUpdateValue,
  ): DeltaStatic {
    this.setHTMLToEditor(html);
    DeltaConverter.quillInstance.formatText(index, length, format, value);
    const formatted = { ...DeltaConverter.getFormated };
    this.clearEditor();
    return formatted;
  }

  static insertText(
    html: string,
    index: number,
    text: string,
  ): DeltaStatic {
    this.setHTMLToEditor(html);
    DeltaConverter.quillInstance.insertText(index, text);
    const formatted = { ...DeltaConverter.getFormated };
    this.clearEditor();
    return formatted;
  }

  static removeStyles(html: string, index: number, length: number): DeltaStatic {
    this.setHTMLToEditor(html);
    DeltaConverter.quillInstance.removeFormat(index, length);
    const formatted = { ...DeltaConverter.getFormated };
    this.clearEditor();
    return formatted;
  }

  static setHTMLToEditor(html: string): void {
    const delta = this.convertHTMLToDelta(html);
    DeltaConverter.quillInstance.setContents(delta);
  }

  static clearEditor(): void {
    DeltaConverter.quillInstance.setContents(null);
  }

  static insertLink(html: string, posIndex: number, title: string, url: string): DeltaStatic {
    this.setHTMLToEditor(html);
    DeltaConverter.quillInstance.insertText(posIndex, title, 'link', url);
    const formatted = { ...DeltaConverter.getFormated };
    this.clearEditor();
    return formatted;
  }

  static textToHtmlElements(texts: string[]): HTMLElement[] {
    return texts
      .map((x) => this.convertHTMLToDelta(x))
      .map((delta) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.convertDeltaToHtml(delta);
        return tempDiv;
      });
  }

  static splitDeltaByDividers(html: string): HTMLElement[] {
    const delta = this.convertHTMLToDelta(html);
    if (!delta.ops || delta.ops.length === 0) {
      return [];
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = this.convertDeltaToHtml(delta);

    const processList = (node: HTMLElement, tag: 'ul' | 'ol'): HTMLElement[] => {
      const listElements: HTMLElement[] = [];
      for (const subListChild of node.childNodes as unknown as HTMLElement[]) {
        const tempUL = document.createElement(tag);
        tempUL.appendChild(subListChild.cloneNode(true));
        listElements.push(tempUL);
      }
      return listElements;
    };

    const elements: HTMLElement[] = [];
    for (const child of tempDiv.childNodes as any) {
      const htmlChild = child as HTMLElement;
      if (htmlChild.tagName === 'UL') {
        elements.push(...processList(htmlChild, 'ul'));
      } else if (htmlChild.tagName === 'OL') {
        elements.push(...processList(htmlChild, 'ol'));
      } else {
        elements.push(htmlChild);
      }
    }
    return elements;
  }

  static setHtml(html: string): void {
    DeltaConverter.quillInstance.clipboard.dangerouslyPasteHTML(html, 'silent');
  }

  private static convertHTMLToDelta(html: string): DeltaStatic {
    return DeltaConverter.quillInstance.clipboard.convert(html);
  }

  private static convertTextBlocksToDelta(contents: TextBlock[]): DeltaStatic {
    if (!contents || contents.length === 0) {
      return null;
    }
    const staticDelta = {} as DeltaStatic;
    const ops = contents.map((item) => {
      return { insert: item.t ?? '', attributes: this.convertToAttributes(item) };
    });
    staticDelta.ops = ops;
    return staticDelta;
  }

  private static convertToAttributes(block: TextBlock): StringAny {
    if (!block || !block.tt) {
      return {};
    }
    const obj: StringAny = {};
    block.tt.forEach((i) => {
      if (i === TextType.Bold) {
        obj.bold = true;
      }
      if (i === TextType.Italic) {
        obj.italic = true;
      }
    });
    if (block.tc) {
      obj.color = block.tc;
    }
    if (block.l) {
      obj.link = block.l;
    }
    if (block.hc) {
      obj.background = block.hc;
    }
    return obj;
  }

  private static getHighlightColorColor(map: StringAny): string {
    if (!map) {
      return null;
    }
    if (map.background) {
      return map.background;
    }
    return null;
  }

  private static getList(map: StringAny): DeltaListEnum {
    if (!map) {
      return null;
    }
    if (map.list) {
      return map.list;
    }
    return null;
  }

  private static getHeader(map: StringAny): number {
    if (!map) {
      return null;
    }
    if (map.header) {
      return map.header;
    }
    return null;
  }

  private static getLink(map: StringAny): string {
    if (!map) {
      return null;
    }
    if (map.link) {
      return map.link;
    }
    return null;
  }

  private static getTextColor(map: StringAny): string {
    if (!map) {
      return null;
    }
    if (map.color) {
      return map.color;
    }
    return null;
  }

  private static getTextTypes(map: StringAny): TextType[] {
    const types: TextType[] = [];
    if (!map) {
      return types;
    }
    if (map.bold) {
      types.push(TextType.Bold);
    }
    if (map.italic) {
      types.push(TextType.Italic);
    }
    return types;
  }
}
