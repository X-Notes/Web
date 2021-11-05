import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { BaseText, ContentModel, ContentTypeENUM } from '../../models/content-model.model';
import { ApiNoteContentService } from '../services/api-note-content.service';
import { ApiTextService } from '../services/api-text.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { StructureDiffs, PositionDiff } from './models/structure-diffs';

export interface ContentAndIndex<T extends ContentModel> {
  index: number;
  content: T;
}

@Injectable()
export class ContentEditorContentsService{
  private contentsSync: ContentModel[] = [];

  private contents: ContentModel[]; // TODO MAKE DICTIONARY

  private timer: NodeJS.Timeout;

  private noteId: string;

  private updateSubject: BehaviorSubject<boolean>;

  private saveSubject: BehaviorSubject<boolean>;

  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private apiNoteContentService: ApiNoteContentService,
    private contentEditorMomentoStateService: ContentEditorMomentoStateService,
    private apiTexts: ApiTextService,
  ) {
  }

  init(contents: ContentModel[], noteId: string) {
    this.noteId = noteId;
    this.initContent(contents);
    this.contentEditorMomentoStateService.save(this.getContents);

   this.destroyAndInitSubject(); 

    this.updateSubject.pipe(filter(x => x === true), debounceTime(200))
        .subscribe(() => { this.processChanges();});
    this.saveSubject.pipe(filter(x => x === true), debounceTime(200))
        .subscribe(() => this.contentEditorMomentoStateService.save(this.getContents));
  }

  destroyAndInitSubject() {
    this.updateSubject?.complete();
    this.updateSubject = new BehaviorSubject<boolean>(false);
    this.saveSubject?.complete();
    this.saveSubject = new BehaviorSubject<boolean>(false);
  }

  initOnlyRead(contents: ContentModel[], noteId: string) {
    this.noteId = noteId;
    this.contents = contents;
  }

  private initContent(contents: ContentModel[]) {
    this.contents = contents;
    this.contentsSync = [];
    for (const item of contents) {
      this.contentsSync.push(item.copy());
    }
  }

  get getContents() {
    return this.contents;
  }

  // eslint-disable-next-line class-methods-use-this
  changeAndSave() {
    this.updateSubject.next(true);
    this.saveSubject.next(true);
  }

  change() {
    this.updateSubject.next(true);
  }

  private processChanges() {
        const structureDiffs = this.getStructureDiffs(this.contentsSync, this.getContents);
        if (structureDiffs.isAnyChanges()) {
          this.apiNoteContentService
          .syncContentsStructure(this.noteId, structureDiffs)
          .pipe(take(1))
          .subscribe(x => {
            this.contentsSync = this.patchStructuralChanges(this.contentsSync, structureDiffs);
            this.processTextsChanges();
          });
        } else {
          this.processTextsChanges();
        }
  }

  private processTextsChanges() {
    const textDiffs = this.getTextDiffs(this.contentsSync, this.getContents);
    if(textDiffs.length > 0) {
      this.apiTexts.syncTextContents(this.noteId, textDiffs).pipe(take(1)).subscribe(
        (resp) => {
          for(const text of textDiffs){
            const item = this.contentsSync.find(x => x.id === text.id) as BaseText;
            item.update(text);
          }
      });
    }
  }

  // STRUCTURE
  private patchStructuralChanges(itemsForPatch: ContentModel[], diffs: StructureDiffs): ContentModel[] {
    if(diffs.removedItems.length > 0) {
      itemsForPatch = itemsForPatch.filter(x => !diffs.removedItems.some(z => z === x.id))
    }
    if(diffs.newItems.length > 0) {
      for (const item of diffs.newItems) {
        itemsForPatch.push(item.copy());
      }
    }
    if(diffs.positions.length > 0){
      for(const pos of diffs.positions){
        itemsForPatch.find(x => x.id === pos.id).order = pos.order;
      }
    }
    return itemsForPatch;
  }

  private getStructureDiffs(oldContents: ContentModel[], newContents: ContentModel[]): StructureDiffs {
    const diffs: StructureDiffs = new StructureDiffs();

    for(const contentSync of oldContents) {
      if(!newContents.some(x => x.id === contentSync.id)){
        diffs.removedItems.push(contentSync.id);
      }
    }

    for (let i = 0; i < newContents.length; i += 1) {
      const content = newContents[i];
      if(!oldContents.some(x => x.id === content.id) && content.typeId === ContentTypeENUM.Text){
        content.order = i;
        diffs.newItems.push(content as BaseText);
      }
      if(oldContents.some(x => x.id === content.id) && oldContents.find(x => x.id === content.id).order !== i) {
        diffs.positions.push(new PositionDiff(i, newContents[i].id));
      }
    }

    return diffs;
  }

  // TEXT
  private patchTextDiffs(texts: BaseText[]) {
    texts.forEach(item => this.setSafe(item, item.id));
  }

  private getTextDiffs(oldContents: ContentModel[], newContents: ContentModel[]): BaseText[] {
    const texts: BaseText[] = [];
    for(const content of newContents){
      const isNeedUpdate = oldContents.some(x => x.typeId === ContentTypeENUM.Text && content.typeId === ContentTypeENUM.Text && 
                x.id === content.id && !content.isEqual(x));
      if(isNeedUpdate){
        texts.push(content as BaseText)
      }
    }
    return texts;
  }

  // Restore Prev
  restorePrev() {
    if(this.contentEditorMomentoStateService.isEmpty()){
      return;
    }
    const prev = this.contentEditorMomentoStateService.getPrev();
    if(!this.isContentsEquals(prev, this.contents)) { 

      let isNeedChange = false;

      const structureDiffs = this.getStructureDiffs(this.contents, prev);
      if(structureDiffs.isAnyChanges()) {
        this.contents = this.patchStructuralChanges(this.contents, structureDiffs);
        isNeedChange = true;
      }

      const textDiffs = this.getTextDiffs(this.contents, prev);
      if(textDiffs && textDiffs.length > 0){
        this.patchTextDiffs(textDiffs);
        isNeedChange = true;
      }

      if(isNeedChange){
        this.change();
      }
    }
  }

  isContentsEquals(f: ContentModel[], s: ContentModel[]){
    for(const content of f){
      const itemForCompare = s.find(x => x.id === content.id);
      if(!itemForCompare || !content.isEqual(itemForCompare)) {
        return false;
      }
    }
    for(const content of s){
      const itemForCompare = f.find(x => x.id === content.id);
      if(!itemForCompare || !content.isEqual(itemForCompare)) {
        return false;
      }
    }
    return true;
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

  findContentAndIndexById<T extends ContentModel>(contents: ContentModel[], contentId: string): ContentAndIndex<T> {
    for (let i = 0; i < contents.length; i += 1) {
      if (contents[i].id === contentId) {
        const obj: ContentAndIndex<T> = { index: i, content: contents[i] as T };
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
  setUnsafe(data: ContentModel, index: number): void {
    this.contents[index] = data;
  }

  setSafe(data: ContentModel, contentId: string): number {
    const obj = this.getContentAndIndexById(contentId);
    this.contents[obj.index] = data;
    return obj.index;
  }

  setSafeContentsAndSyncContents(data: ContentModel, contentId: string): number {
    const obj = this.getContentAndIndexById(contentId);
    const obj2 = this.findContentAndIndexById(this.contentsSync, contentId);
    if(obj && obj2){
      this.contents[obj.index] = data;
      this.contentsSync[obj2.index] = data;
      return obj.index;
    }
    throw new Error("Content not found");
  }

  insertInto(data: ContentModel, index: number) {
    this.contents.splice(index, 0, data);
  }

  insertToEnd(data: ContentModel) {
    this.contents.push(data);
  }

  insertToStart(data: ContentModel) {
    this.contents.unshift(data);
  }
}
