import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, interval } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import {
  updateNoteContentAutoTimerDelay,
  updateNoteContentDelay,
} from 'src/app/core/defaults/bounceDelay';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { AudiosCollection } from '../../../models/editor-models/audios-collection';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { DocumentsCollection } from '../../../models/editor-models/documents-collection';
import { PhotosCollection } from '../../../models/editor-models/photos-collection';
import { VideosCollection } from '../../../models/editor-models/videos-collection';
import { BaseAddToCollectionItemsCommand } from '../../models/api/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../../models/api/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../../models/api/base-update-collection-info-command';
import { NoteStructureResult } from '../../models/api/notes/note-structure-result';
import { NoteUpdateIds } from '../../models/api/notes/note-update-ids';
import { UpdatePhotosCollectionInfoCommand } from '../../models/api/photos/update-photos-collection-info-command';
import { ApiAudiosService } from '../../services/api-audios.service';
import { ApiDocumentsService } from '../../services/api-documents.service';
import { ApiNoteContentService } from '../../services/api-note-content.service';
import { ApiPhotosService } from '../../services/api-photos.service';
import { ApiTextService } from '../../services/api-text.service';
import { ApiVideosService } from '../../services/api-videos.service';
import { StructureDiffs } from '../models/structure-diffs';
import { ContentEditorContentsService } from './content-editor-contents.service';

export interface SyncResult {
  isNeedLoadMemory: boolean;
}

export class ItemsDiffs {
  constructor(
    public contentId: string,
    public itemsToAdd: BaseFile[],
    public itemsToRemove: BaseFile[],
  ) {}
}

@Injectable()
export class ContentEditorSyncService {
  intervalSyncer = interval(updateNoteContentAutoTimerDelay);

  private noteId: string;

  private isEdit = false;

  private updateSubject: BehaviorSubject<boolean>;

  private updateImmediatelySubject: BehaviorSubject<boolean>;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onStructureSync$: BehaviorSubject<NoteStructureResult>;

  private isSync = false;

  constructor(
    private contentService: ContentEditorContentsService,
    private apiContent: ApiNoteContentService,
    private store: Store,
    private apiTexts: ApiTextService,
    private apiAudios: ApiAudiosService,
    private apiVideos: ApiVideosService,
    private apiDocuments: ApiDocumentsService,
    private apiPhotos: ApiPhotosService,
    private snackService: SnackBarWrapperService,
    private translateService: TranslateService,
  ) {
    this.initTimer();
  }

  initTimer(): void {
    this.intervalSyncer.subscribe(() => this.change());
  }

  initEdit(noteId: string): void {
    this.isEdit = true;
    this.noteId = noteId;

    this.destroyAndInitSubject();

    this.updateSubject
      .pipe(
        filter((x) => x === true && !this.isSync),
        debounceTime(updateNoteContentDelay),
      )
      .subscribe(() => {
        this.processChanges();
      });
    //
    this.updateImmediatelySubject
      .pipe(filter((x) => x === true && !this.isSync))
      .subscribe(async () => {
        await this.processChanges();
        this.snackService.buildNotification(this.translateService.instant('snackBar.saved'), null);
      });
  }

  initProcessChangesAutoTimer(): void {}

  change() {
    if (!this.isEdit) return;
    this.updateSubject.next(true);
  }

  changeImmediately() {
    this.updateImmediatelySubject.next(true);
  }

  destroyAndInitSubject() {
    this.updateSubject?.complete();
    this.updateSubject = new BehaviorSubject<boolean>(false);

    this.updateImmediatelySubject?.complete();
    this.updateImmediatelySubject = new BehaviorSubject<boolean>(false);

    this.onStructureSync$?.complete();
    this.onStructureSync$ = new BehaviorSubject<NoteStructureResult>(null);
  }

  private async processChanges() {
    this.isSync = true;
    await this.processStructureChanges();
    await Promise.all([this.processTextsChanges(), this.processFileEntities()]);
    this.isSync = false;
  }

  private async processStructureChanges(): Promise<void> {
    const [structureDiffs, res] = this.contentService.getStructureDiffsNew();
    if (structureDiffs.isAnyChanges()) {
      const resp = await this.apiContent
        .syncContentsStructure(this.noteId, structureDiffs)
        .toPromise();

      if (resp.success) {
        this.updateIds(structureDiffs, resp.data.updateIds);
        this.contentService.patchStructuralChangesNew(structureDiffs, resp.data.removedIds);
        if (res.isNeedLoadMemory) {
          this.store.dispatch(LoadUsedDiskSpace);
        }
        this.onStructureSync$.next(resp.data);
      }
    }
  }

  private updateIds(structureDiffs: StructureDiffs, updateIds: NoteUpdateIds[]): void {
    if (!updateIds || updateIds.length === 0) return;
    structureDiffs.updateIdForAll(updateIds);
    this.contentService.updateIds(updateIds);
  }

  private async processFileEntities() {
    const res = await Promise.all([
      this.processPhotosChanges(),
      this.processAudiosChanges(),
      this.processDocumentsChanges(),
      this.processVideosChanges(),
    ]);
    if (res.some((x) => x.isNeedLoadMemory)) {
      this.store.dispatch(LoadUsedDiskSpace);
    }
  }

  private async processPhotosChanges(): Promise<SyncResult> {
    const result: SyncResult = { isNeedLoadMemory: false };
    const type = ContentTypeENUM.Photos;
    const collectionsToUpdate = this.getCollectionsInfoDiffs<PhotosCollection>(type);
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
      const item = this.contentService.getSyncContentById<PhotosCollection>(collection.id);
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiPhotos.addItemsToCollection(command).toPromise();
        this.syncAddingNewItems(diff.contentId, diff.itemsToAdd);
        result.isNeedLoadMemory = true;
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiPhotos.removeItemsFromCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<PhotosCollection>(diff.contentId);
        item?.removeItemsFromCollection(ids);
        result.isNeedLoadMemory = true;
      }
    }
    return result;
  }

  private async processAudiosChanges(): Promise<SyncResult> {
    const result: SyncResult = { isNeedLoadMemory: false };
    const type = ContentTypeENUM.Audios;
    // UPDATE MAIN INFO
    const collectionsToUpdate = this.getCollectionsInfoDiffs<AudiosCollection>(type);
    for (const collection of collectionsToUpdate) {
      const command = new BaseUpdateCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
      );
      await this.apiAudios.updateInfo(command).toPromise();
      const item = this.contentService.getSyncContentById<AudiosCollection>(collection.id);
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiAudios.addItemsToCollection(command).toPromise();
        this.syncAddingNewItems(diff.contentId, diff.itemsToAdd);
        result.isNeedLoadMemory = true;
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiAudios.removeItemsFromCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<AudiosCollection>(diff.contentId);
        item?.removeItemsFromCollection(ids);
        result.isNeedLoadMemory = true;
      }
    }
    return result;
  }

  private async processDocumentsChanges(): Promise<SyncResult> {
    const result: SyncResult = { isNeedLoadMemory: false };
    const type = ContentTypeENUM.Documents;
    // UPDATE MAIN INFO
    const collectionsToUpdate = this.getCollectionsInfoDiffs<DocumentsCollection>(type);
    for (const collection of collectionsToUpdate) {
      const command = new BaseUpdateCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
      );
      await this.apiDocuments.updateInfo(command).toPromise();
      const item = this.contentService.getSyncContentById<DocumentsCollection>(collection.id);
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiDocuments.addItemsToCollection(command).toPromise();
        this.syncAddingNewItems(diff.contentId, diff.itemsToAdd);
        result.isNeedLoadMemory = true;
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiDocuments.removeItemsFromCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<DocumentsCollection>(diff.contentId);
        item?.removeItemsFromCollection(ids);
        result.isNeedLoadMemory = true;
      }
    }
    return result;
  }

  private async processVideosChanges(): Promise<SyncResult> {
    const result: SyncResult = { isNeedLoadMemory: false };
    const type = ContentTypeENUM.Videos;
    const collectionsToUpdate = this.getCollectionsInfoDiffs<VideosCollection>(type);
    for (const collection of collectionsToUpdate) {
      const command = new BaseUpdateCollectionInfoCommand(
        this.noteId,
        collection.id,
        collection.name,
      );
      await this.apiVideos.updateInfo(command).toPromise();
      const item = this.contentService.getSyncContentById<VideosCollection>(collection.id);
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiVideos.addItemsToCollection(command).toPromise();
        this.syncAddingNewItems(diff.contentId, diff.itemsToAdd);
        result.isNeedLoadMemory = true;
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiVideos.removeItemsFromCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<VideosCollection>(diff.contentId);
        item?.removeItemsFromCollection(ids);
        result.isNeedLoadMemory = true;
      }
    }
    return result;
  }

  private syncAddingNewItems(contentId: string, files: BaseFile[]): void {
    const item = this.contentService.getSyncContentById<BaseCollection<BaseFile>>(contentId);
    item?.addItemsToCollection(files);
  }

  private async processTextsChanges() {
    const textDiffs = this.getTextDiffs();
    if (textDiffs.length > 0) {
      await this.apiTexts.syncContents(this.noteId, textDiffs).toPromise();
      for (const text of textDiffs) {
        const item = this.contentService.getSyncContentById<BaseText>(text.id);
        item.patch(text);
      }
    }
  }

  private getTextDiffs(): BaseText[] {
    const oldContents = this.contentService.getTextSyncContents;
    const newContents = this.contentService.getTextContents;
    const contents: BaseText[] = [];
    for (const content of newContents) {
      const isNeedUpdate = oldContents.some((x) => x.id === content.id && !content.isEqual(x));
      if (isNeedUpdate) {
        contents.push(content.copy());
      }
    }
    return contents;
  }

  private getCollectionsInfoDiffs<T extends BaseCollection<BaseFile>>(type: ContentTypeENUM): T[] {
    const oldContents = this.contentService.getCollectionSyncContents;
    const newContents = this.contentService.getCollectionContents;
    const contents: T[] = [];
    for (const content of newContents) {
      const isNeedUpdate = oldContents.some(
        (x) => x.typeId === type && x.id === content.id && !content.isEqualCollectionInfo(x),
      );
      if (isNeedUpdate) {
        contents.push(content as T);
      }
    }
    return contents;
  }

  private getCollectionItemsDiffs(contentType: ContentTypeENUM): ItemsDiffs[] {
    const oldContents = this.contentService.getCollectionSyncContents;
    const newContents = this.contentService.getCollectionContents;
    const result: ItemsDiffs[] = [];
    for (const content of newContents) {
      const contentForCompare = oldContents.find(
        (x) => x.id === content.id && x.typeId === contentType,
      );
      if (contentForCompare) {
        const [IsEqual, itemsToAdd, itemsToRemove] =
          content.getIsEqualIdsToAddIdsToRemove(contentForCompare);
        if (!IsEqual) {
          const ent = new ItemsDiffs(content.id, itemsToAdd, itemsToRemove);
          result.push(ent);
        }
      }
    }
    return result;
  }
}
