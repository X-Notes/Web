import Quill, { DeltaOperation, DeltaStatic, RangeStatic } from 'quill';
import { TextBlock, TextType } from '../../../models/editor-models/base-text';

export interface StringAny {
  [key: string]: any;
}

export class DeltaConverter {
  static quillInstance: Quill;

  static initQuill() {
    const id = 'hidden-text-editor';
    const quillDIV = document.createElement('div');
    quillDIV.id = id;
    document.body.appendChild(quillDIV);
    DeltaConverter.quillInstance = new Quill(`#${id}`);
    console.log('quill: ', DeltaConverter.quillInstance);
  }

  static convertToTextBlocks(delta: DeltaStatic): TextBlock[] {
    if (!delta.ops || delta.ops.length === 0) {
      return [];
    }
    const result: TextBlock[] = [];
    delta.ops.forEach((item) => {
      const block = new TextBlock();
      const clearStr = item.insert?.replace(/[\r\n]+/g, '');
      if (clearStr) {
        block.text = clearStr;
        block.textTypes = this.getTextTypes(item.attributes);
        block.textColor = this.getTextColor(item.attributes);
        block.highlightColor = this.getHighlightColorColor(item.attributes);
        result.push(block);
      }
    });
    return result;
  }

  static convertToDelta(contents: TextBlock[]): DeltaOperation[] {
    if (!contents || contents.length === 0) {
      return [];
    }
    return contents.map((item) => {
      return { insert: item.text, attributes: this.convertToAttibutes(item) };
    });
  }

  static convertDeltaToHtml = (delta: DeltaOperation[] | any): string => {
    if (!delta || delta.length === 0) {
      return null;
    }
    DeltaConverter.quillInstance.setContents(delta);
    const result = DeltaConverter.quillInstance.root.innerHTML;
    DeltaConverter.quillInstance.setContents(null);
    return result;
  };

  static setStyles(
    html: string,
    index: number,
    length: number,
    format: string,
    value: boolean,
  ): string {
    const delta = this.convertHTMLToDelta(html);
    DeltaConverter.quillInstance.setContents(delta);
    const deltaT = DeltaConverter.quillInstance.formatText(index, length, format, value);
    const formatted = { ...DeltaConverter.getFormated };
    DeltaConverter.quillInstance.setContents(null);
    return this.convertDeltaToHtml(formatted);
  }

  static convertHTMLToDelta(html: string): DeltaStatic {
    return DeltaConverter.quillInstance.clipboard.convert(html);
  }

  static setHtml(html: string): void {
    DeltaConverter.quillInstance.clipboard.dangerouslyPasteHTML(html, 'silent');
  }

  static get getFormated(): DeltaStatic {
    return DeltaConverter.quillInstance.getContents();
  }

  private static convertToAttibutes(block: TextBlock): StringAny {
    if (!block || !block.textTypes) {
      return {};
    }
    const obj: StringAny = {};
    block.textTypes.forEach((i) => {
      if (i === TextType.Bold) {
        obj.bold = true;
      }
      if (i === TextType.Italic) {
        obj.italic = true;
      }
    });
    if (block.textColor) {
      obj.color = block.textColor;
    }
    if (block.highlightColor) {
      obj.background = block.highlightColor;
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
