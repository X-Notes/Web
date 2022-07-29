import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { updateNoteContentDelay } from 'src/app/core/defaults/bounceDelay';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { AudioModel, AudiosCollection } from '../../../models/editor-models/audios-collection';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import {
  DocumentModel,
  DocumentsCollection,
} from '../../../models/editor-models/documents-collection';
import { Photo, PhotosCollection } from '../../../models/editor-models/photos-collection';
import { VideoModel, VideosCollection } from '../../../models/editor-models/videos-collection';
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
import { ContentEditorContentsService } from './content-editor-contents.service';

export interface SyncResult {
  isNeedLoadMemory: boolean;
}

export class ItemsDiffs<T extends BaseFile> {
  constructor(public contentId: string, public itemsToAdd: T[], public itemsToRemove: T[]) {}
}

@Injectable()
export class ContentEditorSyncService {
  private noteId: string;

  private updateSubject: BehaviorSubject<boolean>;

  private updateImmediatelySubject: BehaviorSubject<boolean>;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onStructureSync$: BehaviorSubject<NoteStructureResult>;

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
  ) {}

  init(noteId: string): void {
    this.noteId = noteId;

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
  }

  change() {
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
    await this.processStructureChanges();
    this.processTextsChanges();
    this.processFileEntities();
  }

  private async processStructureChanges(): Promise<void> {
    const [structureDiffs, res] = this.contentService.getStructureDiffsNew();
    if (structureDiffs.isAnyChanges()) {
      const resp = await this.apiContent
        .syncContentsStructure(this.noteId, structureDiffs)
        .toPromise();

      if (resp.success) {
        this.updateIds(resp.data.updateIds);
        this.contentService.patchStructuralChangesNew(structureDiffs, resp.data.removedIds);
        if (res.isNeedLoadMemory) {
          this.store.dispatch(LoadUsedDiskSpace);
        }
        this.onStructureSync$.next(resp.data);
      }
    }
  }

  private updateIds(updateIds: NoteUpdateIds[]): void {
    if (!updateIds || updateIds.length === 0) return;

    for (const update of updateIds) {
      const syncContent = this.contentService.getSyncContentById(update.prevId);
      if (syncContent) {
        syncContent.prevId = syncContent.id;
        syncContent.id = update.id;
      }
      const content = this.contentService.getContentById(update.prevId);
      if (content) {
        content.prevId = content.id;
        content.id = update.id;
      }
    }
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
    const collectionsToUpdate = this.getCollectionsOrTextInfoDiffs<PhotosCollection>(
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
      const item = this.contentService.getSyncContentById<PhotosCollection>(collection.id);
      item?.updateInfo(collection);
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs<Photo>(ContentTypeENUM.Photos);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiPhotos.addItemsToCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<PhotosCollection>(diff.contentId);
        item?.addItemsToCollection(diff.itemsToAdd);
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
    // UPDATE MAIN INFO
    const collectionsToUpdate = this.getCollectionsOrTextInfoDiffs<AudiosCollection>(
      ContentTypeENUM.Audios,
    );
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
    const diffs = this.getCollectionItemsDiffs<AudioModel>(ContentTypeENUM.Audios);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiAudios.addItemsToCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<AudiosCollection>(diff.contentId);
        item?.addItemsToCollection(diff.itemsToAdd);
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
    // UPDATE MAIN INFO
    const collectionsToUpdate = this.getCollectionsOrTextInfoDiffs<DocumentsCollection>(
      ContentTypeENUM.Documents,
    );
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
    const diffs = this.getCollectionItemsDiffs<DocumentModel>(ContentTypeENUM.Documents);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiDocuments.addItemsToCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<DocumentsCollection>(diff.contentId);
        item?.addItemsToCollection(diff.itemsToAdd);
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
    const collectionsToUpdate = this.getCollectionsOrTextInfoDiffs<VideosCollection>(
      ContentTypeENUM.Videos,
    );
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
    const diffs = this.getCollectionItemsDiffs<VideoModel>(ContentTypeENUM.Videos);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        await this.apiVideos.addItemsToCollection(command).toPromise();
        const item = this.contentService.getSyncContentById<VideosCollection>(diff.contentId);
        item?.addItemsToCollection(diff.itemsToAdd);
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

  private async processTextsChanges() {
    const textDiffs = this.getCollectionsOrTextInfoDiffs<BaseText>(ContentTypeENUM.Text);
    if (textDiffs.length > 0) {
      await this.apiTexts.syncContents(this.noteId, textDiffs).toPromise();
      for (const text of textDiffs) {
        const item = this.contentService.getSyncContentById<BaseText>(text.id);
        item.patch(text);
      }
    }
  }

  private getCollectionsOrTextInfoDiffs<T extends ContentModelBase>(type: ContentTypeENUM): T[] {
    const oldContents = this.contentService.getSyncContents;
    const newContents = this.contentService.getContents;
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

  private getCollectionItemsDiffs<T extends BaseFile>(type: ContentTypeENUM): ItemsDiffs<T>[] {
    const oldContents = this.contentService.getSyncContents;
    const newContents = this.contentService.getContents;
    const oldContentsMapped = oldContents
      .filter((x) => x.typeId === type)
      .map((x) => x as BaseCollection<T>);
    const newContentsMapped = newContents
      .filter((x) => x.typeId === type)
      .map((x) => x as BaseCollection<T>);

    const result: ItemsDiffs<T>[] = [];

    for (const content of newContentsMapped) {
      const contentForCompare = oldContentsMapped.find((x) => x.id === content.id);
      if (contentForCompare) {
        const [IsEqual, itemsToAdd, itemsToRemove] =
          content.getIsEqualIdsToAddIdsToRemove(contentForCompare);
        if (!IsEqual) {
          result.push(new ItemsDiffs(content.id, itemsToAdd, itemsToRemove));
        }
      }
    }

    return result;
  }
}
