import { Injectable, QueryList } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, interval } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import {
  syncEditorIntervalDelay,
  syncEditorStateIntervalDelay,
  syncNoteStateIntervalDelay,
} from 'src/app/core/defaults/bounceDelay';
import { LoadUsedDiskSpace } from 'src/app/core/stateUser/user-action';
import { SnackBarWrapperService } from 'src/app/shared/services/snackbar/snack-bar-wrapper.service';
import { EditorStructureResult } from '../entities/structure/editor-structure-result';
import { EditorUpdateIds } from '../entities/structure/editor-update-ids';
import { UpdatePhotosCollectionInfoCommand } from '../entities/collections/update-photos-collection-info-command';
import { ApiAudiosService } from '../api/api-audios.service';
import { ApiPhotosService } from '../api/api-photos.service';
import { ApiTextService } from '../api/api-text.service';
import { ApiVideosService } from '../api/api-videos.service';
import { ContentEditorContentsService } from '../ui-services/contents/content-editor-contents.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { ApiDocumentsService } from '../api/api-documents.service';
import { ApiNoteContentService } from '../api/api-editor-content.service';
import { BaseAddToCollectionItemsCommand } from '../entities/collections/base-add-to-collection-items-command';
import { BaseRemoveFromCollectionItemsCommand } from '../entities/collections/base-remove-from-collection-items-command';
import { BaseUpdateCollectionInfoCommand } from '../entities/collections/base-update-collection-info-command';
import { AudiosCollection } from '../entities/contents/audios-collection';
import { BaseCollection } from '../entities/contents/base-collection';
import { BaseFile } from '../entities/contents/base-file';
import { BaseText } from '../entities/contents/base-text';
import { ContentTypeENUM } from '../entities/contents/content-types.enum';
import { DocumentsCollection } from '../entities/contents/documents-collection';
import { PhotosCollection } from '../entities/contents/photos-collection';
import { VideosCollection } from '../entities/contents/videos-collection';
import { TextDiff } from '../entities/text/text-diff';
import { ParentInteraction, ParentInteractionCollection, ParentInteractionHTML } from '../components/parent-interaction.interface';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { SelectionService } from '../ui-services/selection.service';
import { EditorOptions } from '../entities-ui/editor-options';
import { NoteStore } from 'src/app/content/notes/state/notes-state';
import { ApiServiceNotes } from 'src/app/content/notes/api-notes.service';
import { UpdateFullNote, UpdateNoteTitleState } from 'src/app/content/notes/state/notes-actions';
import { Label } from 'src/app/content/labels/models/label.model';

export interface SyncResult {
  isNeedLoadMemory: boolean;
}

export class ItemsDiffs {
  constructor(
    public contentId: string,
    public itemsToAdd: BaseFile[],
    public itemsToRemove: BaseFile[],
  ) { }
}

@Injectable()
export class ContentEditorSyncService {

  elements: QueryList<ParentInteraction<ContentModelBase>>;

  intervalSync = interval(syncEditorIntervalDelay);

  intervalSyncState = interval(syncEditorStateIntervalDelay);

  intervalSyncNoteState = interval(syncNoteStateIntervalDelay);

  private updateSubject: BehaviorSubject<boolean>;

  private updateImmediatelySubject: BehaviorSubject<boolean>;

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public onStructureSync$: BehaviorSubject<EditorStructureResult>;

  private isProcessChanges = false;

  options$: BehaviorSubject<EditorOptions>;

  private isEdit = false;

  constructor(
    private contentService: ContentEditorContentsService,
    private apiContent: ApiNoteContentService,
    private store: Store,
    private apiTexts: ApiTextService,
    private apiAudios: ApiAudiosService,
    private apiVideos: ApiVideosService,
    private apiDocuments: ApiDocumentsService,
    private apiPhotos: ApiPhotosService,
    private apiNotes: ApiServiceNotes,
    private snackService: SnackBarWrapperService,
    private translateService: TranslateService,
    public dc: DestroyComponentService,
    private selectionService: SelectionService,
  ) {
    this.initTimers();
  }

  get isCanBeProcessed(): boolean {
    return this.isEdit && !this.contentService.isRendering;
  }

  get userId(): string {
    return this.options$.getValue().userId;
  }

  get noteId(): string {
    return this.options$.getValue().noteId;
  }

  get folderId(): string {
    return this.options$.getValue().folderId;
  }

  initTimers(): void {
    this.intervalSync.pipe(takeUntil(this.dc.d$))
      .subscribe(() => this.change());
    this.intervalSyncState.pipe(takeUntil(this.dc.d$), filter(() => !this.isProcessChanges && this.userId && !this.contentService.isRendering))
      .subscribe(() => this.processSyncState());
    this.intervalSyncNoteState.pipe(takeUntil(this.dc.d$), filter(() => !!this.userId))
      .subscribe(() => this.processSyncNoteState());
  }

  async processSyncNoteState() {
    const note = this.store.selectSnapshot(NoteStore.oneFull);
    try {
      const state = await this.apiNotes.syncNoteState(note.id, note.version).toPromise();
      if (state.success && state.data) {
        this.store.dispatch(new UpdateFullNote({
          color: state.data.color,
          version: state.data.version,
          labels: state.data.labels.map((x) => new Label(x))
        }, state.data.noteId));
        this.store.dispatch(new UpdateNoteTitleState(state.data.title, state.data.noteId));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async processSyncState() {
    const state = this.contentService.getEditorStateDiffs();
    try {
      const stateUpdates = await this.apiContent.syncEditorState(this.noteId, state, this.folderId).toPromise();
      if (!stateUpdates.success) return;
      if (stateUpdates.data.idsToDelete?.length > 0) {
        this.contentService.deleteByIds(stateUpdates.data.idsToDelete, true);
      }
      let isStructureUpdate = false;
      if (stateUpdates.data?.contentsToUpdate?.length > 0) {
        for (const content of stateUpdates.data.contentsToUpdate) {
          if (content.typeId === ContentTypeENUM.Text) {
            this.updateText(content as BaseText);
          } else {
            this.updateCollection(content as BaseCollection<BaseFile>);
          }
        }
        isStructureUpdate = true;
      }
      if (stateUpdates.data?.contentsToAdd?.length > 0) {
        for (const content of stateUpdates.data.contentsToAdd) {
          this.contentService.insertInto(content, content.order, true);
        }
        isStructureUpdate = true;
      }
      if (isStructureUpdate) {
        this.contentService.sortByOrder(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  updateText(text: BaseText): void {
    const isSelect = this.selectionService.isSelectedAll(text.id);
    if (isSelect) {
      this.selectionService.resetSelectionAndItems();
    }
    this.contentService.updateContents(text, text.id)
    this.updateUI(text.id, true);
  }

  updateCollection(collection: BaseCollection<BaseFile>): void {
    this.contentService.updateContents(collection, collection.id)
    this.updateUI(collection.id, false);
  }


  updateUI(contentId: string, isText: boolean) {
    const el = this.elements.toArray().find((x) => x.getContentId() === contentId);
    if (!el) {
      return;
    }
    if (isText) {
      const htmlEl = el as ParentInteractionHTML;
      htmlEl.updateWS();
    } else {
      const collectionEl = el as ParentInteractionCollection;
      collectionEl.syncCollectionItems();
    }
  }

  initRead(options$: BehaviorSubject<EditorOptions>): void {
    this.options$ = options$;
  }

  initEdit(options$: BehaviorSubject<EditorOptions>): void {
    this.isEdit = true;
    this.options$ = options$;

    this.destroyAndInitSubject();

    this.updateSubject
      .pipe(
        takeUntil(this.dc.d$),
        filter((x) => x === true && !this.isProcessChanges),
        debounceTime(syncEditorIntervalDelay / 2),
      )
      .subscribe(async () => {
        await this.processChanges();
      });
    //
    this.updateImmediatelySubject
      .pipe(
        takeUntil(this.dc.d$),
        filter((x) => x === true && !this.isProcessChanges),
      )
      .subscribe(async () => {
        await this.processChanges();
        this.snackService.buildNotification(this.translateService.instant('snackBar.saved'), null);
      });
  }

  initProcessChangesAutoTimer(): void { }

  change() {
    this.updateSubject?.next(true);
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
    this.onStructureSync$ = new BehaviorSubject<EditorStructureResult>(null);
  }

  private async processChanges() {
    this.isProcessChanges = true;
    try {
      if (this.isCanBeProcessed) {
        await this.processStructureChanges();
      }
      await Promise.all([this.processTextsChanges(), this.processFileEntities()]);
    } catch (e) {
      console.error('e: ', e);
    } finally {
      this.isProcessChanges = false;
    }
  }

  private async processStructureChanges(): Promise<void> {
    const [structureDiffs, res] = this.contentService.getStructureDiffsNew();
    if (!structureDiffs.isAnyChanges()) { return; }
    const resp = await this.apiContent
      .syncContentsStructure(this.noteId, structureDiffs)
      .toPromise();
    if (resp.success) {
      this.updateIds(resp.data.updateIds);
      this.contentService.patchStructuralChangesNew(resp.data.updates);
      if (res.isNeedLoadMemory) {
        this.store.dispatch(LoadUsedDiskSpace);
      }
      this.onStructureSync$.next(resp.data);
    }
  }

  private updateIds(updateIds: EditorUpdateIds[]): void {
    if (!updateIds || updateIds.length === 0) return;
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
      const resp = await this.apiPhotos.updateInfo(command).toPromise();
      if (resp.success) {
        const item = this.contentService.getSyncContentById<PhotosCollection>(collection.id);
        item?.updateInfo(collection, resp.data.version, resp.data.updatedDate);
      }
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiPhotos.addItemsToCollection(command).toPromise();
        if (resp.success) {
          const itemsToAdd = diff.itemsToAdd.filter(x => resp.data.fileIds.some(q => q === x.fileId));
          if (itemsToAdd?.length > 0) {
            this.syncAddingNewItems(diff.contentId, itemsToAdd, resp.data.version, resp.data.updatedDate);
            result.isNeedLoadMemory = true;
          }
        }
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiPhotos.removeItemsFromCollection(command).toPromise();
        if (resp.success) {
          const item = this.contentService.getSyncContentById<PhotosCollection>(diff.contentId);
          item?.removeItemsFromCollection(resp.data.fileIds, resp.data.version, resp.data.updatedDate);
          result.isNeedLoadMemory = true;
        }
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
      const resp = await this.apiAudios.updateInfo(command).toPromise();
      if (resp.success) {
        const item = this.contentService.getSyncContentById<AudiosCollection>(collection.id);
        item?.updateInfo(collection, resp.data.version, resp.data.updatedDate);
      }
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiAudios.addItemsToCollection(command).toPromise();
        if (resp.success) {
          const itemsToAdd = diff.itemsToAdd.filter(x => resp.data.fileIds.some(q => q === x.fileId));
          if (itemsToAdd?.length > 0) {
            this.syncAddingNewItems(diff.contentId, itemsToAdd, resp.data.version, resp.data.updatedDate);
            result.isNeedLoadMemory = true;
          }
        }
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiAudios.removeItemsFromCollection(command).toPromise();
        if (resp.success) {
          const item = this.contentService.getSyncContentById<AudiosCollection>(diff.contentId);
          item?.removeItemsFromCollection(resp.data.fileIds, resp.data.version, resp.data.updatedDate);
          result.isNeedLoadMemory = true;
        }
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
      const resp = await this.apiDocuments.updateInfo(command).toPromise();
      if (resp.success) {
        const item = this.contentService.getSyncContentById<DocumentsCollection>(collection.id);
        item?.updateInfo(collection, resp.data.version, resp.data.updatedDate);
      }
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiDocuments.addItemsToCollection(command).toPromise();
        if (resp.success) {
          const itemsToAdd = diff.itemsToAdd.filter(x => resp.data.fileIds.some(q => q === x.fileId));
          if (itemsToAdd?.length > 0) {
            this.syncAddingNewItems(diff.contentId, itemsToAdd, resp.data.version, resp.data.updatedDate);
            result.isNeedLoadMemory = true;
          }
        }
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiDocuments.removeItemsFromCollection(command).toPromise();
        if (resp.success) {
          const item = this.contentService.getSyncContentById<DocumentsCollection>(diff.contentId);
          item?.removeItemsFromCollection(resp.data.fileIds, resp.data.version, resp.data.updatedDate);
          result.isNeedLoadMemory = true;
        }
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
      const resp = await this.apiVideos.updateInfo(command).toPromise();
      if (resp.success) {
        const item = this.contentService.getSyncContentById<VideosCollection>(collection.id);
        item?.updateInfo(collection, resp.data.version, resp.data.updatedDate);
      }
    }
    // UPDATES ITEMS
    const diffs = this.getCollectionItemsDiffs(type);
    for (const diff of diffs) {
      if (diff.itemsToAdd && diff.itemsToAdd.length > 0) {
        const ids = diff.itemsToAdd.map((x) => x.fileId);
        const command = new BaseAddToCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiVideos.addItemsToCollection(command).toPromise();
        if (resp.success) {
          const itemsToAdd = diff.itemsToAdd.filter(x => resp.data.fileIds.some(q => q === x.fileId));
          if (itemsToAdd?.length > 0) {
            this.syncAddingNewItems(diff.contentId, itemsToAdd, resp.data.version, resp.data.updatedDate);
            result.isNeedLoadMemory = true;
          }
        }
      }
      if (diff.itemsToRemove && diff.itemsToRemove.length > 0) {
        const ids = diff.itemsToRemove.map((x) => x.fileId);
        const command = new BaseRemoveFromCollectionItemsCommand(this.noteId, diff.contentId, ids);
        const resp = await this.apiVideos.removeItemsFromCollection(command).toPromise();
        if (resp.success) {
          const item = this.contentService.getSyncContentById<VideosCollection>(diff.contentId);
          item?.removeItemsFromCollection(resp.data.fileIds, resp.data.version, resp.data.updatedDate);
          result.isNeedLoadMemory = true;
        }
      }
    }
    return result;
  }

  private syncAddingNewItems(contentId: string, files: BaseFile[], version: number, updateDate: Date): void {
    const item = this.contentService.getSyncContentById<BaseCollection<BaseFile>>(contentId);
    item?.addItemsToCollection(files, version, updateDate);
  }

  private async processTextsChanges() {
    const textDiffs = this.getTextDiffs();
    if (textDiffs.length > 0) {
      const results = await this.apiTexts.syncContents(this.noteId, textDiffs).toPromise();
      for (const text of textDiffs) {
        const item = this.contentService.getSyncContentById<BaseText>(text.id);
        const v = results.data.find(x => x.contentId === text.id);
        item.patch(text.contents, text.headingTypeId, text.noteTextTypeId, text.checked, v.version, v.updatedDate);
        item.updateDateAndVersion(v.version, v.updatedDate);
      }
    }
  }

  private getTextDiffs(): TextDiff[] {
    const oldContents = this.contentService.getTextSyncContents;
    const newContents = this.contentService.getTextContents;
    const contents: TextDiff[] = [];
    for (const content of newContents) {
      const isNeedUpdate = oldContents.some((x) => x.id === content.id && !content.isEqual(x));
      if (isNeedUpdate) {
        contents.push(new TextDiff().initFrom(content.copy()));
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
        contents.push(content.copy() as T);
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
