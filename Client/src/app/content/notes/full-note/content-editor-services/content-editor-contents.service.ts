import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounce, debounceTime, take } from 'rxjs/operators';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { BaseText, ContentModel } from '../../models/content-model.model';
import { ApiNoteContentService } from '../services/api-note-content.service';
import { ApiTextService } from '../services/api-text.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { StructureDiffs, NewRowDiff, PositionDiff } from './models/structure-diffs';

export interface ContentAndIndex<T extends ContentModel> {
  index: number;
  content: T;
}

@Injectable()
export class ContentEditorContentsService {
  private contentsSync: ContentModel[] = [];

  private contents: ContentModel[]; // TODO MAKE DICTIONARY

  private timer: NodeJS.Timeout;

  private noteId: string;

  private updateSubject = new BehaviorSubject<boolean>(false);

  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private apiNoteContentService: ApiNoteContentService,
    private contentEditorMomentoStateService: ContentEditorMomentoStateService,
    private apiTexts: ApiTextService,
  ) {
    // TODO MAYBE UNSUBSCRIVE & upgrade timer
    this.updateSubject.pipe(debounceTime(500)).subscribe(x => this.processChanges());
  }

  init(contents: ContentModel[], noteId: string) {
    this.initContent(contents, noteId);
    this.contentEditorMomentoStateService.save(this.getContents);
  }

  private initContent(contents: ContentModel[], noteId: string) {
    this.noteId = noteId;
    this.contents = contents;
    for (const item of contents) {
      this.contentsSync.push(item.copy());
    }
    console.log(this.contentsSync);
  }

  get getContents() {
    return this.contents;
  }

  // eslint-disable-next-line class-methods-use-this
  change() {
    this.updateSubject.next(true);
  }

  private processChanges() {
        this.contentEditorMomentoStateService.save(this.getContents);
        // TODO MAYBE TIMER
        const structureDiffs = this.getStructureDiffs(this.getContents);
        if (structureDiffs.isAnyChanges()) {
          this.apiNoteContentService
          .syncContentsStructure(this.noteId, structureDiffs)
          .pipe(take(1))
          .subscribe(x => {
            // TODO PATCH
            this.initContent(this.getContents, this.noteId);
            this.processTextsChanges();
          });
        } else {
          this.processTextsChanges();
        }
  }

  private processTextsChanges() {
    const textDiffs = this.getTextDiffs(this.getContents);
    if(textDiffs.length > 0){
      this.apiTexts.syncTextContents(this.noteId, textDiffs).pipe(take(1)).subscribe(
        (resp) => {
          for(const text of textDiffs){
            const item = this.contentsSync.find(x => x.id === text.id) as BaseText;
            item.update(text);
          }
      });
    }
  }

  getStructureDiffs(contents: ContentModel[]): StructureDiffs {
    const diffs: StructureDiffs = new StructureDiffs();

    for (let i = 0; i < this.contentsSync.length; i += 1) {
      const id = this.contentsSync[i].id;
      if(!this.contents.some(x => x.id === id)){
        diffs.removedItems.push(id);
      }
    }

    for (let i = 0; i < contents.length; i += 1) {
      if(!this.contentsSync.some(x => x.id === contents[i].id)){
        diffs.newItems.push(new NewRowDiff(i, contents[i] as BaseText));
      }
      if(this.contentsSync.some(x => x.id === contents[i].id) && (this.contentsSync[i]?.id !== contents[i]?.id)){
        diffs.positions.push(new PositionDiff(i, contents[i].id));
      }
    }

    return diffs;
  }

  getTextDiffs(contents: ContentModel[]): BaseText[] {
    const texts: BaseText[] = [];
    for(const content of contents){
      const isNeedUpdate = this.contentsSync.some(x => x instanceof BaseText && x.id === content.id && !content.isEqual(x));
      if(isNeedUpdate){
        texts.push(content as BaseText)
      }
    }
    return texts;
  }

  // Restore Prev
  restorePrev() {
    const prev = this.contentEditorMomentoStateService.getPrev();
    this.initContent(prev, this.noteId);
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
    for (let i = 0; i < this.contents.length; i += 1) {
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
