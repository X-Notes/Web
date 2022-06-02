/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { UpdateContentPosition } from 'src/app/core/models/signal-r/innerNote/update-content-position-ws';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { AudioModel, AudiosCollection } from '../../models/editor-models/audios-collection';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { BaseFile } from '../../models/editor-models/base-file';
import { BaseText } from '../../models/editor-models/base-text';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
import {
  DocumentModel,
  DocumentsCollection,
} from '../../models/editor-models/documents-collection';
import { Photo, PhotosCollection } from '../../models/editor-models/photos-collection';
import { VideoModel, VideosCollection } from '../../models/editor-models/videos-collection';
import { BaseAddToCollectionItemsCommand } from '../models/api/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../models/api/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../models/api/base-update-collection-info-command';
import { UpdatePhotosCollectionInfoCommand } from '../models/api/photos/update-photos-collection-info-command';
import { ApiAudiosService } from '../services/api-audios.service';
import { ApiDocumentsService } from '../services/api-documents.service';
import { ApiNoteContentService } from '../services/api-note-content.service';
import { ApiPhotosService } from '../services/api-photos.service';
import { ApiTextService } from '../services/api-text.service';
import { ApiVideosService } from '../services/api-videos.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { StructureDiffs, PositionDiff, ItemForRemove } from './models/structure-diffs';

export interface ContentAndIndex<T extends ContentModelBase> {
  index: number;
  content: T;
}

@Injectable()
export class ContentEditorContentsSynchronizeService {
  private contentsSync: ContentModelBase[] = [];

  private contents: ContentModelBase[]; // TODO MAKE DICTIONARY

  private noteId: string;

  private updateSubject: BehaviorSubject<boolean>;

  private updateImmediatelySubject: BehaviorSubject<boolean>;

  private saveSubject: BehaviorSubject<boolean>;

  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private snackService: SnackBarWrapperService,
    private apiNoteContentService: ApiNoteContentService,
    private contentEditorMomentoStateService: ContentEditorMomentoStateService,
    private apiTexts: ApiTextService,
    private apiAudios: ApiAudiosService,
    private apiVideos: ApiVideosService,
    private apiDocuments: ApiDocumentsService,
    private apiPhotos: ApiPhotosService,
    private translateService: TranslateService,
  ) {}

  // TODO 1. Worker
  // TODO 2. File Content process change + ctrlx + z
  //

  init(contents: ContentModelBase[], noteId: string) {
    this.noteId = noteId;
    this.initContent(contents);
    this.contentEditorMomentoStateService.saveToStack(this.getContents);

    this.destroyAndInitSubject();

    this.updateSubject
      .pipe(
        filter((x) => x === true),
        debounceTime(updateNoteContentDelay),
      )
      .subscribe(() => {
        this.processChanges();
      });
    //
    this.updateImmediatelySubject.pipe(filter((x) => x === true)).subscribe(() => {
      this.processChanges();
      this.snackService.buildNotification(this.translateService.instant('snackBar.saved'), null);
    });
    //
    this.saveSubject
      .pipe(
        filter((x) => x === true),
        debounceTime(updateNoteContentDelay),
      )
      .subscribe(() => this.contentEditorMomentoStateService.saveToStack(this.getContents));
  }

  destroyAndInitSubject() {
    this.updateSubject?.complete();
    this.updateSubject = new BehaviorSubject<boolean>(false);
    //
    this.saveSubject?.complete();
    this.saveSubject = new BehaviorSubject<boolean>(false);
    //
    this.updateImmediatelySubject?.complete();
    this.updateImmediatelySubject = new BehaviorSubject<boolean>(false);
  }

  initOnlyRead(contents: ContentModelBase[], noteId: string) {
    this.noteId = noteId;
    this.contents = contents;
  }

  private initContent(contents: ContentModelBase[]) {
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

  changeImmediately() {
    this.updateImmediatelySubject.next(true);
  }

  private async processChanges() {
    const structureDiffs = this.getStructureDiffs(this.contentsSync, this.getContents);
    if (structureDiffs.isAnyChanges()) {
      const resp = await this.apiNoteContentService
        .syncContentsStructure(this.noteId, structureDiffs)
        .toPromise();

      if (resp.success) {
        this.contentsSync = this.patchStructuralChanges(
          this.contentsSync,
          structureDiffs,
          resp.data.removedIds,
        );
      }
    }
    this.processTextsChanges();
    this.processFileEntities();
  }

  private processFileEntities() {
    this.processPhotosChanges();
    this.processAudiosChanges();
    this.processDocumentsChanges();
    this.processVideosChanges();
  }

  private async processPhotosChanges() {
    const collectionsToUpdate = this.getContentTextOrMainInfoDiffs<PhotosCollection>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Photos,
    );
    for (const collection of collectionsToUpdate) {
      const command = new UpdatePhotosCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
        collection.countInRow,
        collection.width,
        collection.height,
      );
      await this.apiPhotos.updateInfo(command).toPromise();
      const item = this.contentsSync.find((x) => x.id === collection.id) as PhotosCollection;
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs<Photo>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Photos,
    );
    for (const [contentId, itemsToAdd, itemsToRemove] of diffs) {
      if (itemsToAdd && itemsToAdd.length > 0) {
        const ids = itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiPhotos.addItemsToCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as PhotosCollection;
        item?.addItemsToCollection(itemsToAdd);
      }
      if (itemsToRemove && itemsToRemove.length > 0) {
        const ids = itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiPhotos.removeItemsFromCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as PhotosCollection;
        item?.removeItemsFromCollection(ids);
      }
    }
  }

  private async processAudiosChanges() {
    // UPDATE MAIN INFO
    const collectionsToUpdate = this.getContentTextOrMainInfoDiffs<AudiosCollection>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Audios,
    );
    for (const collection of collectionsToUpdate) {
      const command = new BaseUpdateCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
      );
      await this.apiAudios.updateInfo(command).toPromise();
      const item = this.contentsSync.find((x) => x.id === collection.id) as AudiosCollection;
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs<AudioModel>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Audios,
    );
    for (const [contentId, itemsToAdd, itemsToRemove] of diffs) {
      if (itemsToAdd && itemsToAdd.length > 0) {
        const ids = itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiAudios.addItemsToCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as AudiosCollection;
        item?.addItemsToCollection(itemsToAdd);
      }
      if (itemsToRemove && itemsToRemove.length > 0) {
        const ids = itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiAudios.removeItemsFromCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as AudiosCollection;
        item?.removeItemsFromCollection(ids);
      }
    }
  }

  private async processDocumentsChanges() {
    // UPDATE MAIN INFO
    const collectionsToUpdate = this.getContentTextOrMainInfoDiffs<DocumentsCollection>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Documents,
    );
    for (const collection of collectionsToUpdate) {
      const command = new BaseUpdateCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
      );
      await this.apiDocuments.updateInfo(command).toPromise();
      const item = this.contentsSync.find((x) => x.id === collection.id) as DocumentsCollection;
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs<DocumentModel>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Documents,
    );
    for (const [contentId, itemsToAdd, itemsToRemove] of diffs) {
      if (itemsToAdd && itemsToAdd.length > 0) {
        const ids = itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiDocuments.addItemsToCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as DocumentsCollection;
        item?.addItemsToCollection(itemsToAdd);
      }
      if (itemsToRemove && itemsToRemove.length > 0) {
        const ids = itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiDocuments.removeItemsFromCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as DocumentsCollection;
        item?.removeItemsFromCollection(ids);
      }
    }
  }

  private async processVideosChanges() {
    const collectionsToUpdate = this.getContentTextOrMainInfoDiffs<VideosCollection>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Videos,
    );
    for (const collection of collectionsToUpdate) {
      const command = new BaseUpdateCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
      );
      await this.apiVideos.updateInfo(command).toPromise();
      const item = this.contentsSync.find((x) => x.id === collection.id) as VideosCollection;
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs<VideoModel>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Videos,
    );
    for (const [contentId, itemsToAdd, itemsToRemove] of diffs) {
      if (itemsToAdd && itemsToAdd.length > 0) {
        const ids = itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiVideos.addItemsToCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as VideosCollection;
        item?.addItemsToCollection(itemsToAdd);
      }
      if (itemsToRemove && itemsToRemove.length > 0) {
        const ids = itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, contentId, ids);
        await this.apiVideos.removeItemsFromCollection(command).toPromise();
        const item = this.contentsSync.find((x) => x.id === contentId) as VideosCollection;
        item?.removeItemsFromCollection(ids);
      }
    }
  }

  private async processTextsChanges() {
    const textDiffs = this.getContentTextOrMainInfoDiffs<BaseText>(
      this.contentsSync,
      this.getContents,
      ContentTypeENUM.Text,
    );
    if (textDiffs.length > 0) {
      await this.apiTexts.syncContents(this.noteId, textDiffs).toPromise();
      for (const text of textDiffs) {
        const item = this.contentsSync.find((x) => x.id === text.id) as BaseText;
        item.patch(text);
      }
    }
  }

  // STRUCTURE
  // eslint-disable-next-line class-methods-use-this
  private patchStructuralChanges(
    itemsForPatch: ContentModelBase[],
    diffs: StructureDiffs,
    removedIds: string[],
  ): ContentModelBase[] {
    if (removedIds && removedIds.length > 0) {
      itemsForPatch = itemsForPatch.filter((x) => !removedIds.some((id) => id === x.id));
    }
    if (diffs.newTextItems.length > 0) {
      for (const item of diffs.newTextItems) {
        itemsForPatch.push(item.copy());
      }
    }
    if (diffs.photosCollectionItems.length > 0) {
      for (const item of diffs.photosCollectionItems) {
        itemsForPatch.push(item.copy());
      }
    }
    if (diffs.audiosCollectionItems.length > 0) {
      for (const item of diffs.audiosCollectionItems) {
        itemsForPatch.push(item.copy());
      }
    }
    if (diffs.videosCollectionItems.length > 0) {
      for (const item of diffs.videosCollectionItems) {
        itemsForPatch.push(item.copy());
      }
    }
    if (diffs.documentsCollectionItems.length > 0) {
      for (const item of diffs.documentsCollectionItems) {
        itemsForPatch.push(item.copy());
      }
    }
    if (diffs.positions.length > 0) {
      for (const pos of diffs.positions) {
        itemsForPatch.find((x) => x.id === pos.id).order = pos.order;
      }
    }
    return itemsForPatch;
  }

  // eslint-disable-next-line class-methods-use-this
  private getStructureDiffs(
    oldContents: ContentModelBase[],
    newContents: ContentModelBase[],
  ): StructureDiffs {
    const diffs: StructureDiffs = new StructureDiffs();

    for (const contentSync of oldContents) {
      if (!newContents.some((x) => x.id === contentSync.id)) {
        diffs.removedItems.push(new ItemForRemove(contentSync.id));
      }
    }

    for (let i = 0; i < newContents.length; i += 1) {
      const content = newContents[i];
      if (!oldContents.some((x) => x.id === content.id)) {
        content.order = i;
        diffs.push(content);
      }
      const oldContent = oldContents.find((x) => x.id === content.id);
      if (oldContent && oldContent.order !== i) {
        diffs.positions.push(new PositionDiff(i, newContents[i].id));
      }
    }

    return diffs;
  }

  // TEXT
  private patchTextDiffs(texts: BaseText[]) {
    texts.forEach((item) => this.setSafe(item, item.id));
  }

  // FILES
  private patchFileContentDiffs(contents: ContentModelBase[]) {
    contents.forEach((item) => this.setSafe(item, item.id));
  }

  // eslint-disable-next-line class-methods-use-this
  private getContentTextOrMainInfoDiffs<T extends ContentModelBase>(
    oldContents: ContentModelBase[],
    newContents: ContentModelBase[],
    type: ContentTypeENUM,
  ): T[] {
    const contents: T[] = [];
    for (const content of newContents.filter((x) => x.typeId === type)) {
      const isNeedUpdate = oldContents.some(
        (x) => x.typeId === type && x.id === content.id && !content.isTextOrCollectionInfoEqual(x),
      );
      if (isNeedUpdate) {
        contents.push(content as T);
      }
    }
    return contents;
  }

  private getCollectionItemsDiffs<T extends BaseFile>(
    oldContents: ContentModelBase[],
    newContents: ContentModelBase[],
    type: ContentTypeENUM,
  ): [string, T[], T[]][] {
    const oldContentsMapped = oldContents
      .filter((x) => x.typeId === type)
      .map((x) => x as BaseCollection<T>);
    const newContentsMapped = newContents
      .filter((x) => x.typeId === type)
      .map((x) => x as BaseCollection<T>);

    const result: [string, T[], T[]][] = [];

    for (const content of newContentsMapped) {
      const contentForCompare = oldContentsMapped.find((x) => x.id === content.id);
      if (contentForCompare) {
        const [IsEqual, itemsToAdd, itemsToRemove] =
          content.getIsEqualIdsToAddIdsToRemove(contentForCompare);
        if (!IsEqual) {
          result.push([content.id, itemsToAdd, itemsToRemove]);
        }
      }
    }

    return result;
  }

  // Restore Prev
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restorePrev() {
    if (this.contentEditorMomentoStateService.isEmpty()) {
      return;
    }
    const prev = this.contentEditorMomentoStateService.getPrev();
    if (!this.isContentsEquals(prev, this.contents)) {
      let isNeedChange = false;

      // STRUCTURE
      const structureDiffs = this.getStructureDiffs(this.contents, prev);
      if (structureDiffs.isAnyChanges()) {
        const removeIds = structureDiffs.removedItems.map((x) => x.id);
        this.contents = this.patchStructuralChanges(this.contents, structureDiffs, removeIds);
        isNeedChange = true;
      }

      // TEXTS
      const textDiffs = this.getContentTextOrMainInfoDiffs<BaseText>(
        this.contents,
        prev,
        ContentTypeENUM.Text,
      );
      if (textDiffs && textDiffs.length > 0) {
        this.patchTextDiffs(textDiffs);
        isNeedChange = true;
      }

      // FILES
      const audiosDiffs = this.getContentTextOrMainInfoDiffs<AudiosCollection>(
        this.contents,
        prev,
        ContentTypeENUM.Audios,
      );
      if (audiosDiffs && audiosDiffs.length > 0) {
        this.patchFileContentDiffs(audiosDiffs);
        isNeedChange = true;
      }

      const photosDiffs = this.getContentTextOrMainInfoDiffs<PhotosCollection>(
        this.contents,
        prev,
        ContentTypeENUM.Photos,
      );
      if (photosDiffs && photosDiffs.length > 0) {
        this.patchFileContentDiffs(photosDiffs);
        isNeedChange = true;
      }

      const documentsDiffs = this.getContentTextOrMainInfoDiffs<DocumentsCollection>(
        this.contents,
        prev,
        ContentTypeENUM.Documents,
      );
      if (documentsDiffs && documentsDiffs.length > 0) {
        this.patchFileContentDiffs(documentsDiffs);
        isNeedChange = true;
      }

      const videosDiffs = this.getContentTextOrMainInfoDiffs<VideosCollection>(
        this.contentsSync,
        this.getContents,
        ContentTypeENUM.Videos,
      );
      if (videosDiffs && videosDiffs.length > 0) {
        this.patchFileContentDiffs(videosDiffs);
        isNeedChange = true;
      }

      if (isNeedChange) {
        this.change();
      }
    }
  }

  isContentsEquals(f: ContentModelBase[], s: ContentModelBase[]) {
    for (const content of f) {
      const itemForCompare = s.find((x) => x.id === content.id);
      if (!itemForCompare || !content.isEqual(itemForCompare)) {
        return false;
      }
    }
    for (const content of s) {
      const itemForCompare = f.find((x) => x.id === content.id);
      if (!itemForCompare || !content.isEqual(itemForCompare)) {
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

  getIndexByContent(content: ContentModelBase) {
    return this.contents.indexOf(content);
  }

  getContentAndIndexById<T extends ContentModelBase>(contentId: string): ContentAndIndex<T> {
    for (let i = 0; i < this.contents.length; i += 1) {
      if (this.contents[i].id === contentId) {
        const obj: ContentAndIndex<T> = { index: i, content: this.contents[i] as T };
        return obj;
      }
    }
    return null;
  }

  findContentAndIndexById<T extends ContentModelBase>(
    contents: ContentModelBase[],
    contentId: string,
  ): ContentAndIndex<T> {
    for (let i = 0; i < contents.length; i += 1) {
      if (contents[i].id === contentId) {
        const obj: ContentAndIndex<T> = { index: i, content: contents[i] as T };
        return obj;
      }
    }
    return null;
  }

  getContentById<T extends ContentModelBase>(contentId: string): T {
    return this.contents.find((x) => x.id === contentId) as T;
  }

  getSyncContentById<T extends ContentModelBase>(contentId: string): T {
    return this.contentsSync.find((x) => x.id === contentId) as T;
  }

  getContentByIndex<T extends ContentModelBase>(index: number): T {
    return this.contents[index] as T;
  }

  // REMOVE
  deleteById(contentId: string, isDeleteInContentSync: boolean) {
    this.contents = this.contents.filter((x) => x.id !== contentId);
    if (isDeleteInContentSync) {
      this.contentsSync = this.contentsSync.filter((x) => x.id !== contentId);
    }
  }

  deleteByIds(contentIds: string[], isDeleteInContentSync: boolean) {
    this.contents = this.contents.filter((x) => !contentIds.some((q) => q === x.id));
    if (isDeleteInContentSync) {
      this.contentsSync = this.contentsSync.filter((x) => !contentIds.some((q) => q === x.id));
    }
  }

  // INSERT, UPDATE
  setUnsafe(data: ContentModelBase, index: number): void {
    this.contents[index] = data;
  }

  setSafe(data: ContentModelBase, contentId: string): number {
    const obj = this.getContentAndIndexById(contentId);
    this.contents[obj.index] = data;
    return obj.index;
  }

  setSafeContentsAndSyncContents(data: ContentModelBase, contentId: string): void {
    const obj = this.getContentAndIndexById(contentId);
    const obj2 = this.findContentAndIndexById(this.contentsSync, contentId);
    if (obj) {
      this.contents[obj.index] = data;
    }
    if (obj2) {
      this.contentsSync[obj2.index] = data.copy();
    }
  }

  setSafeSyncContents(data: ContentModelBase, contentId: string): void {
    const obj = this.findContentAndIndexById(this.contentsSync, contentId);
    if (obj) {
      this.contentsSync[obj.index] = data;
    }
    throw new Error('Content not found');
  }

  // INSERT
  insertInto(data: ContentModelBase, index: number, isSync = false) {
    this.contents.splice(index, 0, data);
    if (isSync) {
      this.contentsSync.splice(index, 0, data.copy());
    }
  }

  insertToEnd(data: ContentModelBase, isSync = false) {
    this.contents.push(data);
    if (isSync) {
      this.contentsSync.push(data);
    }
  }

  insertToStart(data: ContentModelBase, isSync = false) {
    this.contents.unshift(data);
    if (isSync) {
      this.contentsSync.unshift(data);
    }
  }

  // UPDATE & PATCH
  updatePositions(positions: UpdateContentPosition[]): void {
    for (const pos of positions) {
      const content = this.getContentById(pos.contentId);
      if (content) {
        content.order = pos.order;
      }
      const contentSync = this.contentsSync.find((x) => x.id === pos.contentId);
      if (contentSync) {
        contentSync.order = pos.order;
      }
    }
    this.contents = this.contents.sort((a, b) => a.order - b.order);
    this.contentsSync = this.contentsSync.sort((a, b) => a.order - b.order);
  }

  transformTo(collection: BaseCollection<BaseFile>, idsToDelete: string[]) {
    this.deleteByIds(idsToDelete, true);
    this.insertInto(collection, collection.order, true);
  }

  patchText(data: BaseText, isSync = false): void {
    const content = this.getContentById(data.id);
    if (content) {
      content.patch(data);
    }
    const contentSync = this.getSyncContentById(data.id);
    if (contentSync && isSync) {
      contentSync.patch(data);
    }
  }

  patchCollectionInfo(data: Partial<BaseCollection<BaseFile>>, isSync = false): void {
    const content = this.getContentById<BaseCollection<BaseFile>>(data.id);
    if (content) {
      content.updateInfo(data);
    }
    const contentSync = this.getSyncContentById<BaseCollection<BaseFile>>(data.id);
    if (contentSync && isSync) {
      contentSync.updateInfo(data);
    }
  }

  addItemsToCollections<T extends BaseFile>(files: T[], contentId: string, isSync = false): void {
    const content = this.getContentById<BaseCollection<BaseFile>>(contentId);
    if (content) {
      content.addItemsToCollection(files);
    }
    const contentSync = this.getSyncContentById<BaseCollection<BaseFile>>(contentId);
    if (contentSync && isSync) {
      contentSync.addItemsToCollection(files);
    }
  }

  removeItemsFromCollections(fileIds: string[], contentId: string, isSync = false): void {
    const content = this.getContentById<BaseCollection<BaseFile>>(contentId);
    if (content) {
      content.removeItemsFromCollection(fileIds);
    }
    const contentSync = this.getSyncContentById<BaseCollection<BaseFile>>(contentId);
    if (contentSync && isSync) {
      contentSync.removeItemsFromCollection(fileIds);
    }
  }
}
