import { Injectable } from '@angular/core';
import { ContentModel, ContentType, Html, HtmlType, Photos } from './models/ContentMode';

@Injectable()
export class FullNoteContentService {

  constructor() { }

  getContent(): ContentModel[] { // TODO REMOVE
    const array: ContentModel[] = [];


    let fs = `TypeScript реализует объектно-ориентированный подход, в нем есть полноценная поддержка классов. Класс представляет шаблон
    для создания объектов и инкапсулирует функциональность, которую должен иметь объект. Класс определяет состояние и поведение, которыми обладает объект.`;

    array.push(this.getHTMLElement(fs));

    fs = `Свойство CSS line-height устанавливает величину пространства между строка
    ми, например в тексте. В блочных элементах оно указывает минимальную высоту блоков с
    трок внутри элемента. В незамещаемых внутристрочных элементах —указывает высоту, которая используется для вычисления высоты блоков строк.`;

    array.push(this.getHTMLElement(fs));

    array.push(this.getPhotoELEMENT());


    fs = 'H111111111';
    array.push(this.getHTMLElement(fs, HtmlType.H1));

    fs = 'H22222222222222221';
    array.push(this.getHTMLElement(fs, HtmlType.H2));

    fs = 'H333333333333333333';
    array.push(this.getHTMLElement(fs, HtmlType.H3));


    fs = 'DOT LIST ITEM1';
    array.push(this.getHTMLElement(fs, HtmlType.DOTLIST));

    fs = 'DOT LIST ITEM2';
    array.push(this.getHTMLElement(fs, HtmlType.DOTLIST));

    // DEFAULT
    array.push(this.getHTMLElement());


    return array;
  }

  getHTMLElement(str = '', type = HtmlType.Text)
  {
    const contentDefault = new ContentModel<Html>();
    contentDefault.contentId = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.type = ContentType.HTML;
    contentDefault.data = {
      html: str,
      type
    };
    return contentDefault;
  }

  getPhotoELEMENT()
  {
    const content3 = new ContentModel<Photos>();
    content3.contentId = (Math.random() * (100000 - 1) + 1).toString();
    content3.type = ContentType.PHOTO;
    content3.data = {
      photos: []
    };
    content3.data.photos.push(
      'https://aif-s3.aif.ru/images/018/931/90c365f50b5b311c39ea69d3e4d84345.jpg',
      'https://aif-s3.aif.ru/images/018/931/90c365f50b5b311c39ea69d3e4d84345.jpg',
    );
    return content3;
  }

  getDotListElement()
  {

  }

}
