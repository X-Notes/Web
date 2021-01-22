import { Injectable } from '@angular/core';
import { ContentModel, ContentType, HtmlText, Photos, HeadingType, Heading, DotList, NumberList, CheckedList, BaseText } from './models/ContentMode';

@Injectable()
export class FullNoteContentService {

  constructor() { }

  getContent(): ContentModel[] { // TODO REMOVE
    const array: ContentModel[] = [];


    let fs = `TypeScript реализует объектно-ориентированный подход, в нем есть полноценная поддержка классов. Класс представляет шаблон
    для создания объектов и инкапсулирует функциональность, которую должен иметь объект. Класс определяет состояние и поведение, которыми обладает объект.`;

    array.push(this.getTextElement(fs));

    fs = `Свойство CSS line-height устанавливает величину пространства между строка
    ми, например в тексте. В блочных элементах оно указывает минимальную высоту блоков с
    трок внутри элемента. В незамещаемых внутристрочных элементах —указывает высоту, которая используется для вычисления высоты блоков строк.`;

    array.push(this.getTextElement(fs));

    array.push(this.getPhotoELEMENT());


    fs = 'H111111111';
    array.push(this.getHeadingElement(fs, HeadingType.H1));

    fs = 'H22222222222222221';
    array.push(this.getHeadingElement(fs, HeadingType.H2));

    fs = 'H333333333333333333';
    array.push(this.getHeadingElement(fs, HeadingType.H3));


    fs = 'DOT LIST ITEM1';
    array.push(this.getDotList(fs));

    fs = 'DOT LIST ITEM2';
    array.push(this.getDotList(fs));

    fs = 'NUMBER LIST 1';
    array.push(this.getNumberList(fs));

    fs = 'NUMBER LIST 2';
    array.push(this.getNumberList(fs));

    fs = 'NUMBER LIST 3';
    array.push(this.getNumberList(fs));

    fs = 'CHECk LIST 1';
    array.push(this.getCheckList(fs));

    fs = 'CHECk LIST 2';
    array.push(this.getCheckList(fs));

    fs = 'CHECk LIST 3';
    array.push(this.getCheckList(fs));

    // DEFAULT
    array.push(this.getTextElement());


    return array;
  }

  getTextElement(str = '')
  {
    const contentDefault = new ContentModel<HtmlText>();
    contentDefault.type = ContentType.TEXT;
    contentDefault.contentId = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.data = {
      content: str
    };
    return contentDefault;
  }

  getDotList(str = '')
  {
    const contentDefault = new ContentModel<DotList>();
    contentDefault.type = ContentType.DOTLIST;
    contentDefault.contentId = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.data = {
      content: str
    };
    return contentDefault;
  }

  getNumberList(str = '')
  {
    const contentDefault = new ContentModel<NumberList>();
    contentDefault.type = ContentType.NUMBERLIST;
    contentDefault.contentId = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.data = {
      content: str
    };
    return contentDefault;
  }

  getCheckList(str = '')
  {
    const contentDefault = new ContentModel<CheckedList>();
    contentDefault.type = ContentType.CHECKLIST;
    contentDefault.contentId = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.data = {
      checked: false,
      content: str,
    };
    return contentDefault;
  }

  getHeadingElement(str = '', headingType = HeadingType.H1)
  {
    const contentDefault = new ContentModel<Heading>();
    contentDefault.type = ContentType.HEADING;
    contentDefault.contentId = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.data = {
      content: str,
      headingType
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

  getContentByType(type: ContentType)
  {
    switch (type)
    {
      case ContentType.TEXT: {
        return this.getTextElement();
      }
      case ContentType.HEADING: {
        return this.getHeadingElement();
      }
      case ContentType.DOTLIST: {
        return this.getDotList();
      }
      case ContentType.CHECKLIST: {
        return this.getCheckList();
      }
      case ContentType.NUMBERLIST: {
        return this.getNumberList();
      }
      case ContentType.PHOTO: {
        return this.getPhotoELEMENT();
      }
    }
  }

  getTextContentByType(type: ContentType): ContentModel<BaseText>
  {
    switch (type)
    {
      case ContentType.TEXT: {
        return this.getTextElement();
      }
      case ContentType.HEADING: {
        return this.getHeadingElement();
      }
      case ContentType.DOTLIST: {
        return this.getDotList();
      }
      case ContentType.CHECKLIST: {
        return this.getCheckList();
      }
      case ContentType.NUMBERLIST: {
        return this.getNumberList();
      }
    }
  }

}
