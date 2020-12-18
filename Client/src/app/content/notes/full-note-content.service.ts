import { Injectable } from '@angular/core';
import { ContentModel, ContentType, Html, Photos } from './models/ContentMode';

@Injectable()
export class FullNoteContentService {

  constructor() { }

  getContent(): ContentModel[] { // TODO REMOVE
    const array: ContentModel[] = [];

    const content1 = new ContentModel<Html>();
    content1.type = ContentType.HTML;
    content1.data = {
      html: `<p>
    TypeScript реализует объектно-ориентированный подход, в нем есть полноценная поддержка классов. Класс представляет шаблон
для создания объектов и инкапсулирует функциональность, которую должен иметь объект. Класс определяет состояние и поведение, которыми обладает объект.
     </p>`
    };

    const content2 = new ContentModel<Html>();
    content2.type = ContentType.HTML;
    content2.data = {
      html: `<p>
      TypeScript реализует объектно-ориентированный подход, в нем есть полноценная поддержка классов. Класс представляет шаблон
для создания объектов и инкапсулирует функциональность, которую должен иметь объект. Класс определяет состояние и поведение, которыми обладает объект.
       </p>`
    };

    const content3 = new ContentModel<Photos>();
    content3.type = ContentType.PHOTO;
    content3.data = {
      photos: []
    };
    content3.data.photos.push(
      'https://aif-s3.aif.ru/images/018/931/90c365f50b5b311c39ea69d3e4d84345.jpg',
      'https://aif-s3.aif.ru/images/018/931/90c365f50b5b311c39ea69d3e4d84345.jpg',
      );

    array.push(content1, content2, content3);
    return array;
  }
}
