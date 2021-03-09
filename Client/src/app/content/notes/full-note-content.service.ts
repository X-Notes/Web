import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContentType, Album, HeadingType, BaseText } from './models/ContentMode';

@Injectable()
export class FullNoteContentService implements OnDestroy {

  destroy = new Subject<void>();

  constructor(private httpClient: HttpClient) { }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }



  getTextElement(str = '') {
    const contentDefault = new BaseText();
    contentDefault.type = ContentType.DEFAULT;
    contentDefault.id = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.content = str;
    return contentDefault;
  }

  getDotList(str = '') {
    const contentDefault = new BaseText();
    contentDefault.type = ContentType.DOTLIST;
    contentDefault.id = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.content = str;
    return contentDefault;
  }

  getNumberList(str = '') {
    const contentDefault = new BaseText();
    contentDefault.type = ContentType.NUMBERLIST;
    contentDefault.id = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.content = str;
    return contentDefault;
  }

  getCheckList(str = '') {
    const contentDefault = new BaseText();
    contentDefault.type = ContentType.CHECKLIST;
    contentDefault.id = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.content = str;
    contentDefault.checked = false;
    return contentDefault;
  }

  getHeadingElement(str = '', headingType = HeadingType.H1) {
    const contentDefault = new BaseText();
    contentDefault.type = ContentType.HEADING;
    contentDefault.headingType = headingType;
    contentDefault.id = (Math.random() * (100000 - 1) + 1).toString();
    contentDefault.content = str;
    return contentDefault;
  }

  getPhotoELEMENT() {
    const max = 20;
    const min = 1;
    const number2 = Math.floor(Math.random() * (max - min + 1) + min);

    const content3 = new Album();
    content3.id = (Math.random() * (100000 - 1) + 1).toString();
    content3.type = ContentType.ALBUM;
    content3.photos = [];

    this.httpClient.get(`https://picsum.photos/v2/list?page=${number2}&limit=3`)
    .pipe(takeUntil(this.destroy))
    .subscribe(z => {
      for (const item of z as any)
      {
        content3.photos.push({
          id: item.id,
          url: item.download_url,
          height: item.height,
          width: item.width,
          loaded: false
        });
      }
    });
    return content3;
  }

  getContentByType(type: ContentType) {
    switch (type) {
      case ContentType.DEFAULT: {
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
      case ContentType.ALBUM: {
        return this.getPhotoELEMENT();
      }
    }
  }

  getTextContentByType(type: ContentType): BaseText {
    switch (type) {
      case ContentType.DEFAULT: {
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
