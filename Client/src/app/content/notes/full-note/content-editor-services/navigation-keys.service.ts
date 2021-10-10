import { Injectable } from '@angular/core';
import { ContentModel } from '../../models/content-model.model';

@Injectable()
export class NavigationKeysService {

  private content: ContentModel;

  set setSontent(content: ContentModel) {
    this.content = content;
  }

  get getContent() {
    return this.content;
  }

}
