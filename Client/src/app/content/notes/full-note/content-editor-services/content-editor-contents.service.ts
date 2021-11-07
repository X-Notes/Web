import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { AudiosCollection, BaseText, ContentModel, ContentTypeENUM, DocumentsCollection, PhotosCollection, VideosCollection } from '../../models/content-model.model';
import { ApiAudiosService } from '../services/api-audios.service';
import { ApiDocumentsService } from '../services/api-documents.service';
import { ApiNoteContentService } from '../services/api-note-content.service';
import { ApiPhotosService } from '../services/api-photos.service';
import { ApiTextService } from '../services/api-text.service';
import { ApiVideosService } from '../services/api-videos.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { StructureDiffs, PositionDiff, ItemForRemove } from './models/structure-diffs';

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
    private apiAudios: ApiAudiosService,
    private apiVideos: ApiVideosService,
    private apiDocuments: ApiDocumentsService,
    private apiPhotos: ApiPhotosService,
  ) {
  }

    // TODO 1. Worker
    // TODO 2. File Content process change + ctrlx + z
    //

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
            this.processFileEntities();
          });
        } else {
          this.processTextsChanges();
          this.processFileEntities();
        }
  }


  private processFileEntities(){
    this.processPhotosChanges();
    this.processAudiosChanges();
    this.processDocumentsChanges();
    this.processVideosChanges();
  }

  private processPhotosChanges(){
    const diffs = this.getContentDiffs<PhotosCollection>(this.contentsSync, this.getContents, ContentTypeENUM.Photos);
    if(diffs.length > 0) {
      this.apiPhotos.syncContents(this.noteId, diffs).pipe(take(1)).subscribe(
        (resp) => {
          for(const diff of diffs){
            const item = this.contentsSync.find(x => x.id === diff.id) as PhotosCollection;
            item.update(diff);
          }
      });
    }
  }

  private processAudiosChanges(){
    const diffs = this.getContentDiffs<AudiosCollection>(this.contentsSync, this.getContents, ContentTypeENUM.Audios);
    console.log(diffs);
    if(diffs.length > 0) {
      this.apiAudios.syncContents(this.noteId, diffs).pipe(take(1)).subscribe(
        (resp) => {
          for(const diff of diffs){
            const item = this.contentsSync.find(x => x.id === diff.id) as AudiosCollection;
            item.update(diff);
          }
      });
    }
  }

  private processDocumentsChanges(){
    const diffs = this.getContentDiffs<DocumentsCollection>(this.contentsSync, this.getContents, ContentTypeENUM.Documents);
    if(diffs.length > 0) {
      this.apiDocuments.syncContents(this.noteId, diffs).pipe(take(1)).subscribe(
        (resp) => {
          for(const diff of diffs){
            const item = this.contentsSync.find(x => x.id === diff.id) as DocumentsCollection;
            item.update(diff);
          }
      });
    }
  }

  private processVideosChanges(){
    const diffs = this.getContentDiffs<VideosCollection>(this.contentsSync, this.getContents, ContentTypeENUM.Videos);
    if(diffs.length > 0) {
      this.apiVideos.syncContents(this.noteId, diffs).pipe(take(1)).subscribe(
        (resp) => {
          for(const diff of diffs){
            const item = this.contentsSync.find(x => x.id === diff.id) as VideosCollection;
            item.update(diff);
          }
      });
    }
  }

  private processTextsChanges() {
    const textDiffs = this.getContentDiffs<BaseText>(this.contentsSync, this.getContents, ContentTypeENUM.Text);
    if(textDiffs.length > 0) {
      this.apiTexts.syncContents(this.noteId, textDiffs).pipe(take(1)).subscribe(
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
      itemsForPatch = itemsForPatch.filter(x => !diffs.removedItems.some(z => z.id === x.id))
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
        diffs.removedItems.push(new ItemForRemove(contentSync.id));
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

  // FILES
  private patchFileContentDiffs(contents: ContentModel[]) {
    contents.forEach(item => this.setSafe(item, item.id));
  }

  private getContentDiffs<T extends ContentModel>(oldContents: ContentModel[], newContents: ContentModel[], type: ContentTypeENUM): T[] {
    const contents: T[] = [];
    for(const content of newContents.filter(x => x.typeId === type)){
      const isNeedUpdate = oldContents.some(x => x.typeId === type && x.id === content.id && !content.isEqual(x));
      if(isNeedUpdate){
        contents.push(content as T)
      }
    }
    return contents;
  }

  // Restore Prev
  restorePrev() {
    if(this.contentEditorMomentoStateService.isEmpty()){
      return;
    }
    const prev = this.contentEditorMomentoStateService.getPrev();
    if(!this.isContentsEquals(prev, this.contents)) { 

      let isNeedChange = false;

      // STRUCTURE
      const structureDiffs = this.getStructureDiffs(this.contents, prev);
      if(structureDiffs.isAnyChanges()) {
        this.contents = this.patchStructuralChanges(this.contents, structureDiffs);
        isNeedChange = true;
      }

      // TEXTS
      const textDiffs = this.getContentDiffs<BaseText>(this.contents, prev, ContentTypeENUM.Text);
      if(textDiffs && textDiffs.length > 0){
        this.patchTextDiffs(textDiffs);
        isNeedChange = true;
      }

      // FILES
      const audiosDiffs = this.getContentDiffs<AudiosCollection>(this.contents, prev, ContentTypeENUM.Audios);
      if(audiosDiffs && audiosDiffs.length > 0){
        this.patchFileContentDiffs(audiosDiffs);
        isNeedChange = true;
      }

      const photosDiffs = this.getContentDiffs<PhotosCollection>(this.contents, prev, ContentTypeENUM.Photos);
      if(photosDiffs && photosDiffs.length > 0){
        this.patchFileContentDiffs(photosDiffs);
        isNeedChange = true;
      }

      const documentsDiffs = this.getContentDiffs<DocumentsCollection>(this.contents, prev, ContentTypeENUM.Documents);
      if(documentsDiffs && documentsDiffs.length > 0){
        this.patchFileContentDiffs(documentsDiffs);
        isNeedChange = true;
      }

      const videosDiffs = this.getContentDiffs<VideosCollection>(this.contentsSync, this.getContents, ContentTypeENUM.Videos);
      if(videosDiffs && videosDiffs.length > 0){
        this.patchFileContentDiffs(videosDiffs);
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
  deleteById(contentId: string, isDeleteInContentSync: boolean) {
    this.contents = this.contents.filter((x) => x.id !== contentId);
    if(isDeleteInContentSync){
      this.contentsSync = this.contentsSync.filter((x) => x.id !== contentId);
    }
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

  setSafeSyncContents(data: ContentModel, contentId: string): void {
    const obj = this.findContentAndIndexById(this.contentsSync, contentId);
    if(obj){
      this.contentsSync[obj.index] = data;
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
