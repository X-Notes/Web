/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateContentPosition } from 'src/app/core/models/signal-r/innerNote/update-content-position-ws';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { AudiosCollection } from '../../../models/editor-models/audios-collection';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { DocumentsCollection } from '../../../models/editor-models/documents-collection';
import { PhotosCollection } from '../../../models/editor-models/photos-collection';
import { VideosCollection } from '../../../models/editor-models/videos-collection';
import { NoteUpdateIds } from '../../models/api/notes/note-update-ids';
import { StructureDiffs, PositionDiff, ItemForRemove } from '../models/structure-diffs';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { SyncResult } from './content-editor-sync.service';

export interface ContentAndIndex<T extends ContentModelBase> {
  index: number;
  content: T;
}

@Injectable()
export class ContentEditorContentsService {
  private contentsSync: ContentModelBase[] = [];

  private isEdit = false;

  private contents: ContentModelBase[]; // TODO MAKE DICTIONARY

  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private contentEditorMomentoStateService: ContentEditorMomentoStateService,
  ) {}

  // TODO 1. Worker
  // TODO 2. File Content process change + ctrlx + z
  //

  initEdit(contents: ContentModelBase[]): void {
    this.isEdit = true;
    this.initContent(contents);
    this.contentEditorMomentoStateService.clear();
    this.contentEditorMomentoStateService.saveToStack(contents);
  }

  saveToStack(): void {
    const isContentEqual = this.isContentsEquals();
    if (!isContentEqual) {
      this.contentEditorMomentoStateService.saveToStack(this.contents);
    }
  }

  isSaveStackEmpty(): boolean {
    return this.contentEditorMomentoStateService.isEmpty();
  }

  getPrevFromStack(): ContentModelBase[] {
    return this.contentEditorMomentoStateService.getPrev();
  }

  cleaPrevInStack(): void {
    this.contentEditorMomentoStateService.clearPrev();
  }

  initOnlyRead(contents: ContentModelBase[]) {
    this.contents = contents;
  }

  private initContent(contents: ContentModelBase[]) {
    this.contents = contents;
    this.contentsSync = [];
    for (const item of contents) {
      this.contentsSync.push(item.copy());
    }
  }

  // UI CONTENTS
  get getContents(): ContentModelBase[] {
    return this.contents;
  }

  get getTextContents(): BaseText[] {
    return this.contents.filter((x) => x.typeId === ContentTypeENUM.Text).map((x) => x as BaseText);
  }

  get getCollectionContents(): BaseCollection<BaseFile>[] {
    return this.contents
      .filter((x) => x.typeId !== ContentTypeENUM.Text)
      .map((x) => x as BaseCollection<BaseFile>);
  }

  // SYNC CONTENTS
  get getSyncContents(): ContentModelBase[] {
    return this.contentsSync;
  }

  get getTextSyncContents(): BaseText[] {
    return this.contentsSync
      .filter((x) => x.typeId === ContentTypeENUM.Text)
      .map((x) => x as BaseText);
  }

  get getCollectionSyncContents(): BaseCollection<BaseFile>[] {
    return this.contentsSync
      .filter((x) => x.typeId !== ContentTypeENUM.Text)
      .map((x) => x as BaseCollection<BaseFile>);
  }

  updateIds(updateIds: NoteUpdateIds[]): void {
    if (!updateIds || updateIds.length === 0) return;

    for (const update of updateIds) {
      const syncContent = this.getSyncContentById(update.prevId);
      if (syncContent) {
        syncContent.prevId = syncContent.id;
        syncContent.id = update.id;
      }
      const content = this.getContentById(update.prevId);
      if (content) {
        content.prevId = content.id;
        content.id = update.id;
      }
    }

    // UPDATE IN STACK
    this.contentEditorMomentoStateService.updateIds(updateIds);
  }

  updateContent(contents: ContentModelBase[]) {
    this.contents = contents;
  }

  updateSyncContent(contents: ContentModelBase[]) {
    this.contentsSync = contents;
  }

  deleteContent(contentId: string): number {
    const index = this.getIndexByContentId(contentId);
    this.deleteById(contentId, false);
    return index;
  }

  getStructureDiffsNew(): [StructureDiffs, SyncResult] {
    return this.getStructureDiffs(this.contentsSync, this.getContents);
  }

  getStructureDiffsPrev(prev: ContentModelBase[]): [StructureDiffs, SyncResult] {
    return this.getStructureDiffs(this.contents, prev);
  }

  patchStructuralChangesNew(diffs: StructureDiffs, removedIds: string[]): void {
    const contentToUpdate = this.patchStructuralChanges(this.getSyncContents, diffs, removedIds);
    this.updateSyncContent(contentToUpdate);
  }

  patchStructuralChangesPrev(diffs: StructureDiffs, removedIds: string[]): void {
    const contentToUpdate = this.patchStructuralChanges(this.contents, diffs, removedIds, true);
    this.updateContent(contentToUpdate);
  }

  private patchStructuralChanges(
    content: ContentModelBase[],
    diffs: StructureDiffs,
    removedIds: string[],
    isReloadOrder = false,
  ): ContentModelBase[] {
    if (removedIds && removedIds.length > 0) {
      content = content.filter((x) => !removedIds.some((id) => id === x.id));
    }
    if (diffs.newTextItems.length > 0) {
      for (const item of diffs.newTextItems) {
        content.push(item.copy());
      }
    }
    if (diffs.photosCollectionItems.length > 0) {
      for (const item of diffs.photosCollectionItems) {
        const newItem = item.copy() as PhotosCollection;
        newItem.items = [];
        content.push(newItem);
      }
    }
    if (diffs.audiosCollectionItems.length > 0) {
      for (const item of diffs.audiosCollectionItems) {
        const newItem = item.copy() as AudiosCollection;
        newItem.items = [];
        content.push(newItem);
      }
    }
    if (diffs.videosCollectionItems.length > 0) {
      for (const item of diffs.videosCollectionItems) {
        const newItem = item.copy() as VideosCollection;
        newItem.items = [];
        content.push(newItem);
      }
    }
    if (diffs.documentsCollectionItems.length > 0) {
      for (const item of diffs.documentsCollectionItems) {
        const newItem = item.copy() as DocumentsCollection;
        newItem.items = [];
        content.push(newItem);
      }
    }
    if (diffs.positions.length > 0) {
      for (const pos of diffs.positions) {
        content.find((x) => x.id === pos.id).order = pos.order;
      }
      if (isReloadOrder) {
        this.contents = this.contents.sort((a, b) => a.order - b.order);
      }
    }
    return content;
  }

  // eslint-disable-next-line class-methods-use-this
  private getStructureDiffs(
    oldContents: ContentModelBase[],
    newContents: ContentModelBase[],
  ): [StructureDiffs, SyncResult] {
    const diffs: StructureDiffs = new StructureDiffs();
    const res: SyncResult = { isNeedLoadMemory: false };
    for (const contentSync of oldContents) {
      if (!newContents.some((x) => x.id === contentSync.id)) {
        diffs.removedItems.push(new ItemForRemove(contentSync.id));
        if (contentSync.typeId !== ContentTypeENUM.Text) {
          res.isNeedLoadMemory = true;
        }
      }
    }

    for (let i = 0; i < newContents.length; i += 1) {
      const content = newContents[i];
      if (!oldContents.some((x) => x.id === content.id)) {
        content.order = i;
        diffs.push(content.copy());
      }
      const oldContent = oldContents.find((x) => x.id === content.id);
      if (oldContent && oldContent.order !== i) {
        diffs.positions.push(new PositionDiff(i, newContents[i].id));
      }
    }

    return [diffs, res];
  }

  isContentsEquals() {
    const f = this.getContents;
    const s = this.getSyncContents;
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

  // GET
  getIndexByContentId(contentId: string) {
    const index = this.contents.findIndex((x) => x.id === contentId);
    if (index !== -1) {
      return index;
    }
    return 0;
  }

  getItem<T extends BaseFile>(contentId: string, itemId: string): T {
    const content = this.contents.find((x) => x.id === contentId);
    if (content) {
      return content.getItems.find((x) => x.fileId === itemId) as T;
    }
    return null;
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

  getContentByPrevId<T extends ContentModelBase>(contentId: string): T {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.contents.length; i += 1) {
      if (this.contents[i].prevId === contentId) {
        return this.contents[i] as T;
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
