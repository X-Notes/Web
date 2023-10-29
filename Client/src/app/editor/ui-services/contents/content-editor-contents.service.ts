/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/member-ordering */
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { SnackBarHandlerStatusService } from 'src/app/shared/services/snackbar/snack-bar-handler-status.service';
import { AudiosCollection } from '../../entities/contents/audios-collection';
import { BaseCollection } from '../../entities/contents/base-collection';
import { BaseFile } from '../../entities/contents/base-file';
import { BaseText } from '../../entities/contents/base-text';
import { ContentModelBase } from '../../entities/contents/content-model-base';
import { ContentTypeENUM } from '../../entities/contents/content-types.enum';
import { DocumentsCollection } from '../../entities/contents/documents-collection';
import { PhotosCollection } from '../../entities/contents/photos-collection';
import { VideosCollection } from '../../entities/contents/videos-collection';
import { EditorUpdateIds } from '../../entities/structure/editor-update-ids';
import { EditorStructureDiffs, ItemForRemove, PositionDiff } from '../../entities/structure/editor-structure-diffs';
import { UpdateContentPosition } from '../../entities/ws/update-content-position-ws';
import { UpdateEditorStructureWS } from '../../entities/ws/update-note-structure-ws';
import { SyncResult } from '../../services/content-editor-sync.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { ContentState } from '../../entities/state/content-state';

export interface ContentAndIndex<T extends ContentModelBase> {
  index: number;
  content: T;
}

@Injectable()
export class ContentEditorContentsService {
  private contentsSync: ContentModelBase[] = [];

  private contents: ContentModelBase[]; // TODO MAKE DICTIONARY

  readonly maxContents = 300;

  private progressiveLoadOptions = {
    firstLoadCount: 30,
    stepCount: 5,
    renderInterval: 10,
  };

  onProgressiveAdding = new Subject<void>();

  isRendering = false;

  constructor(
    protected store: Store,
    protected snackBarStatusTranslateService: SnackBarHandlerStatusService,
    private contentEditorMomentoStateService: ContentEditorMomentoStateService,
  ) {}

  // TODO 1. Worker
  // TODO 2. File Content process change + ctrlx + z
  //

  initEdit(contents: ContentModelBase[], progressiveLoading: boolean): void {
    if (progressiveLoading) {
      this.initContentProgressively(contents);
      return;
    }
    this.contents = contents;
    this.initSyncContent(contents);
  }

  initOnlyRead(contents: ContentModelBase[], progressiveLoading: boolean) {
    if (progressiveLoading) {
      this.initContentProgressively(contents);
      return;
    }
    this.contents = contents;
  }

  private initSyncContent(contents: ContentModelBase[]): void {
    this.contentsSync = [];
    for (const item of contents) {
      this.contentsSync.push(item.copy());
    }
  }

  private initContentProgressively(
    contents: ContentModelBase[],
    onRenderCallback?: () => void,
  ): void {
    this.isRendering = true;
    let end = this.progressiveLoadOptions.firstLoadCount;
    if (end > contents.length) {
      end = contents.length;
    }

    const contentsToInit = contents.slice(0, end);
    this.contents = contentsToInit;
    this.contentsSync.push(...contentsToInit.map(x => x.copy()));

    this.onProgressiveAdding.next();

    if (this.contents.length === contents.length) {
      if (onRenderCallback) {
        onRenderCallback();
      }
      this.isRendering = false;
      return;
    }

    const interval = setInterval(() => {
      const start = this.contents.length;
      end = start + this.progressiveLoadOptions.stepCount;
      if (end > contents.length) {
        end = contents.length;
      }
      const contentsToPush = contents.slice(start, end);
      this.contents.push(...contentsToPush);
      this.contentsSync.push(...contentsToPush.map(x => x.copy()));

      this.onProgressiveAdding.next();
      if (start >= contents.length) {
        this.isRendering = false;
        if (onRenderCallback) {
          onRenderCallback();
        }
        clearInterval(interval);
      }
    }, this.progressiveLoadOptions.renderInterval);
  }

  get isCanAddContent(): boolean {
    return this.getContents.length < this.maxContents;
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

  updateIds(updateIds: EditorUpdateIds[]): void {
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

  getStructureDiffsNew(): [EditorStructureDiffs, SyncResult] {
    return this.getStructureDiffs(this.contentsSync, this.getContents);
  }

  getEditorStateDiffs(): ContentState[] {
    return this.contentsSync.map((x) => ({contentId : x.id, version: x.version}))
  }

  patchStructuralChangesNew(updates: UpdateEditorStructureWS): void {
    const contentToUpdate = this.patchStructuralChanges(this.getSyncContents, updates);
    this.updateSyncContent(contentToUpdate);
  }

  private patchStructuralChanges(
    contents: ContentModelBase[],
    updates: UpdateEditorStructureWS,
  ): ContentModelBase[] {
    if (updates.contentIdsToDelete?.length > 0) {
      contents = contents.filter((x) => !updates.contentIdsToDelete.some((id) => id === x.id));
    }
    if (updates.textContentsToAdd?.length > 0) {
      for (const item of updates.textContentsToAdd) {
        contents.push(item.copy());
      }
    }
    if(updates.collectionContentsToAdd?.length > 0) {
      for (const item of updates.collectionContentsToAdd) {
        switch(item.typeId) {
          case ContentTypeENUM.Photos: {
            const newItem = new PhotosCollection({ ...item },  []);
            contents.push(newItem);
            break;
          }
          case ContentTypeENUM.Documents: {
            const newItem = new DocumentsCollection({ ...item },  []);
            contents.push(newItem);
            break;
          }
          case ContentTypeENUM.Videos: {
            const newItem = new VideosCollection({ ...item },  []);
            contents.push(newItem);
            break;
          }
          case ContentTypeENUM.Audios: {
            const newItem = new AudiosCollection({ ...item },  []);
            contents.push(newItem);
            break;
          }
          default: {
            throw new Error('Incorrect type');
          }
        }
      }
    }
    if (updates.positions?.length > 0) {
      for (const pos of updates.positions) {
        const contentToUpdate = contents.find((x) => x.id === pos.contentId);
        if(contentToUpdate){
          contentToUpdate.order = pos.order;
          contentToUpdate.version = pos.version;
        }
      }
    }
    return contents;
  }

  // eslint-disable-next-line class-methods-use-this
  private getStructureDiffs(
    oldContents: ContentModelBase[],
    newContents: ContentModelBase[],
  ): [EditorStructureDiffs, SyncResult] {
    const diffs: EditorStructureDiffs = new EditorStructureDiffs();
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
      const newContent = newContents[i];
      if (!oldContents.some((x) => x.id === newContent.id)) {
        newContent.order = i;
        diffs.push(newContent.copy());
      }
      const oldContent = oldContents.find((x) => x.id === newContent.id);
      if (oldContent && oldContent.order !== i) {
        diffs.positions.push(new PositionDiff(i, newContents[i].id));
      }
    }

    return [diffs, res];
  }

  isContentsEquals(contents: ContentModelBase[]) {
    const uiContents = this.getContents;

    if (uiContents.length !== contents.length) return false;

    for (let i = 0; i < uiContents.length; i += 1) {
      const uiContent = uiContents[i];
      const content = contents[i];
      if (!uiContent.isEqual(content)) return false;
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
  deleteById(contentId: string, isDeleteInContentSync: boolean): void {
    let index = this.contents.findIndex((x) => x.id === contentId);
    if (index > -1) {
      this.contents.splice(index, 1);
    }
    if (isDeleteInContentSync) {
      index = this.contentsSync.findIndex((x) => x.id === contentId);
      if (index > -1) {
        this.contentsSync.splice(index, 1);
      }
    }
  }

  deleteByIds(contentIds: string[], isDeleteInContentSync: boolean): void {
    contentIds.forEach((id) => this.deleteById(id, isDeleteInContentSync));
  }

  deleteByIdsMutate(contentIds: string[], isDeleteInContentSync: boolean): void {
    this.contents = this.contents.filter((x) => !contentIds.some((q) => q === x.id));
    if (isDeleteInContentSync) {
      this.contentsSync = this.contentsSync.filter((x) => !contentIds.some((q) => q === x.id));
    }
  }

  // UPDATE

  updateContents(data: ContentModelBase, contentId: string): void {
    const obj = this.getContentAndIndexById(contentId);
    const obj2 = this.findContentAndIndexById(this.contentsSync, contentId);
    if (obj) {
      this.contents[obj.index] = data;
    }
    if (obj2) {
      this.contentsSync[obj2.index] = data.copy();
    }
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
  updatePositions(positions: UpdateContentPosition[], syncContent: boolean): void {
    for (const pos of positions) {
      const content = this.getContentById(pos.contentId);
      if (content) {
        content.order = pos.order;
      }
      if (syncContent) {
        const contentSync = this.contentsSync.find((x) => x.id === pos.contentId);
        if (contentSync) {
          contentSync.order = pos.order;
        }
      }
    }
    this.sortByOrder(syncContent);
  }

  sortByOrder(syncContent: boolean): void {
    this.contents = this.contents.sort((a, b) => a.order - b.order);
    if (syncContent) {
      this.contentsSync = this.contentsSync.sort((a, b) => a.order - b.order);
    }
  }

  transformTo(collection: BaseCollection<BaseFile>, idsToDelete: string[]) {
    this.deleteByIds(idsToDelete, true);
    this.insertInto(collection, collection.order, true);
  }

  patchText(data: BaseText, isSync = false): void {
    const content = this.getContentById<BaseText>(data.id);
    if (content) {
      content.patch(data.contents, data.metadata, data.version, data.updatedAt);
    }
    const contentSync = this.getSyncContentById<BaseText>(data.id);
    if (contentSync && isSync) {
      contentSync.patch(data.contents, data.metadata, data.version, data.updatedAt);
    }
  }

  patchCollectionInfo(data: Partial<BaseCollection<BaseFile>>, isSync = false): void {
    const content = this.getContentById<BaseCollection<BaseFile>>(data.id);
    if (content) {
      content.updateInfo(data, data.version, data.updatedAt);
    }
    const contentSync = this.getSyncContentById<BaseCollection<BaseFile>>(data.id);
    if (contentSync && isSync) {
      contentSync.updateInfo(data, data.version, data.updatedAt);
    }
  }

  addItemsToCollections<T extends BaseFile>(files: T[], contentId: string, updateDate: Date, version: number, isSync = false): void {
    const content = this.getContentById<BaseCollection<T>>(contentId);
    if (content) {
      content.addItemsToCollection(files, content.version, content.updatedAt);
    }
    const contentSync = this.getSyncContentById<BaseCollection<T>>(contentId);
    if (contentSync && isSync) {
      contentSync.addItemsToCollection(files, contentSync.version, contentSync.updatedAt);
    }
  }

  removeItemsFromCollections(fileIds: string[], contentId: string, updateDate: Date, version: number, isSync = false): void {
    const content = this.getContentById<BaseCollection<BaseFile>>(contentId);
    if (content) {
      content.removeItemsFromCollection(fileIds, content.version, content.updatedAt);
    }
    const contentSync = this.getSyncContentById<BaseCollection<BaseFile>>(contentId);
    if (contentSync && isSync) {
      contentSync.removeItemsFromCollection(fileIds, contentSync.version, contentSync.updatedAt);
    }
  }
}
