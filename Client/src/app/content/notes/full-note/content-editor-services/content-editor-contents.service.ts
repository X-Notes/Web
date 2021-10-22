import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, take } from 'rxjs/operators';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { BaseText, ContentModel } from '../../models/content-model.model';
import { ApiNoteContentService } from '../services/api-note-content.service';
import { ApiTextService } from '../services/api-text.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { StructureDiffs, PositionDiff } from './models/structure-diffs';

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
    this.noteId = noteId;
    this.initContent(contents);
    this.contentEditorMomentoStateService.save(this.getContents);
  }

  private initContent(contents: ContentModel[]) {
    this.contents = contents;
    this.contentsSync = [];
    for (const item of contents) {
      this.contentsSync.push(item.copy());
    }
  }

  private patchStructuralChanges(diffs: StructureDiffs){
    if(diffs.removedItems.length > 0) {
      this.contentsSync = this.contentsSync.filter(x => !diffs.removedItems.some(z => z === x.id))
    }
    if(diffs.newItems.length > 0) {
      for (const item of diffs.newItems) {
        this.contentsSync.push(item.copy());
      }
    }
    if(diffs.positions.length > 0){
      for(const pos of diffs.positions){
        this.contentsSync.find(x => x.id === pos.id).order = pos.order;
      }
    }
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
            this.patchStructuralChanges(structureDiffs);
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

    for(const contentSync of this.contentsSync) {
      if(!this.contents.some(x => x.id === contentSync.id)){
        diffs.removedItems.push(contentSync.id);
      }
    }

    for (let i = 0; i < contents.length; i += 1) {
      const content = contents[i];
      if(!this.contentsSync.some(x => x.id === content.id)){
        content.order = i;
        diffs.newItems.push(content as BaseText);
      }
      if(this.contentsSync.some(x => x.id === content.id) && this.contentsSync.find(x => x.id === content.id).order !== i) {
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
    this.contents = this.contentEditorMomentoStateService.getPrev();
    this.change();
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
