import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { ContentModel } from '../../models/content-model.model';

export interface ContentAndIndex<T extends ContentModel> {
  index: number;
  content: T;
}

@Injectable()
export class ContentEditorContentsService {

  private contentsSync: Record<string, ContentModel> = {};

  private contents: ContentModel[]; // TODO MAKE DICTIONARY

  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
  ) {}

  initContent(contents: ContentModel[]) {
    this.contents = contents;
    for (const item of contents) {
      this.contentsSync[item.id] = item;
    }
  }

  get getContents() {
    return this.contents;
  }

  // eslint-disable-next-line class-methods-use-this
  change() {
    console.log('change');
  }

  // GET INDDEX
  getIndexOrErrorById(contentId: string) {
    const index = this.contents.findIndex((x) => x.id === contentId);
    if (index !== -1) {
      return index;
    }
    throw new Error('Not found');
  }

  getIndexByContent(content: ContentModel) {
    return this.contents.indexOf(content);
  }

  getContentAndIndexById<T extends ContentModel>(contentId: string): ContentAndIndex<T> {
    for (let i = 0; i < this.contents.length; i++) {
      if (this.contents[i].id === contentId) {
        const obj: ContentAndIndex<T> = { index: i, content: this.contents[i] as T };
        return obj;
      }
    }
    return null;
  }

  getContentById<T extends ContentModel>(contentId: string): T {
    return this.contents.find((x) => x.id === contentId) as T;
  }

  getContentByIndex<T extends ContentModel>(index: number): T {
    return this.contents[index] as T;
  }

  // REMOVE
  deleteById(contentId: string) {
    this.contents = this.contents.filter((x) => x.id !== contentId);
  }

  // INSERT, UPDATE
  setUnsafe(data: ContentModel, index: number) {
    this.contents[index] = data;
  }

  setSafe(data: ContentModel, contentId: string): number {
    const obj = this.getContentAndIndexById(contentId);
    this.contents[obj.index] = data;
    return obj.index;
  }

  insertInto(data: ContentModel, index: number) {
    this.contents.splice(index, 0, data);
  }

  insertToEnd(data: ContentModel) {
    this.contents.push(data);
  }
}
