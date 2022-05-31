import { Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UpdateOperationWS } from 'src/app/core/models/signal-r/innerNote/update-operation-ws.enum';
import { SignalRService } from 'src/app/core/signal-r.service';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { BaseFile } from '../../models/editor-models/base-file';
import { PhotosCollection } from '../../models/editor-models/photos-collection';
import { BaseGetNoteFilesByIdsQuery } from '../models/api/base-get-note-files-byIds-query';
import { ParentInteraction } from '../models/parent-interaction.interface';
import { ApiAudiosService } from '../services/api-audios.service';
import { ApiDocumentsService } from '../services/api-documents.service';
import { ApiPhotosService } from '../services/api-photos.service';
import { ApiVideosService } from '../services/api-videos.service';
import { ContentEditorContentsSynchronizeService } from './content-editor-contents.service';

@Injectable()
export class ContentUpdateWsService implements OnDestroy {
  elements: QueryList<ParentInteraction>;

  noteId: string;

  destroy = new Subject<void>();

  constructor(
    private signalRService: SignalRService,
    public contentEditorContentsService: ContentEditorContentsSynchronizeService,
    private apiVideos: ApiVideosService,
    private apiAudios: ApiAudiosService,
    private apiDocuments: ApiDocumentsService,
    private apiPhotos: ApiPhotosService,
  ) {
    this.updateStructure();
    this.updateText();
    this.updateVideoCollections();
    this.updatePhotoCollections();
    this.updateAudioCollections();
    this.updateDocumentCollections();
  }

  updateStructure(): void {
    this.signalRService.updateNoteStructureEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe((content) => {
        if (content) {
          if (content.contentIdsToDelete && content.contentIdsToDelete.length > 0) {
            this.contentEditorContentsService.deleteByIds(content.contentIdsToDelete, true);
          }
          if (content.positions && content.positions.length > 0) {
            this.contentEditorContentsService.updatePositions(content.positions);
          }
          if (content.textContentsToAdd) {
            for (const item of content.textContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
            }
          }
          if (content.photoContentsToAdd) {
            for (const item of content.photoContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
            }
          }
          if (content.audioContentsToAdd) {
            for (const item of content.audioContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
            }
          }
          if (content.videoContentsToAdd) {
            for (const item of content.videoContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
            }
          }
          if (content.documentContentsToAdd) {
            for (const item of content.documentContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
            }
          }
        }
      });
  }

  updateUI(contentId: string) {
    const el = this.elements.toArray().find((x) => x.getContentId() === contentId);
    if (el) {
      el.syncContentWithLayout();
    }
  }

  updateText() {
    this.signalRService.updateTextContentEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe((content) => {
        if (content) {
          this.contentEditorContentsService.patchText(content.collection, true);
          this.updateUI(content.collection.id);
        }
      });
  }

  updateVideoCollections() {
    this.signalRService.updateVideosCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          // TODO
          if (content.operation === UpdateOperationWS.Transform) {
            this.handleTransform(content.collection, content.collectionItemIds);
          }
          if (content.operation === UpdateOperationWS.Update) {
            const obj: Partial<BaseCollection<BaseFile>> = {
              id: content.contentId,
              name: content.name,
              updatedAt: content.entityTime,
            };
            this.contentEditorContentsService.patchCollectionInfo(obj, true);
            this.updateUI(content.contentId);
          }
          if (content.operation === UpdateOperationWS.AddCollectionItems) {
            const obj: BaseGetNoteFilesByIdsQuery = {
              collectionId: content.contentId,
              noteId: this.noteId,
              fileIds: content.collectionItemIds,
            };
            const files = await this.apiVideos.getFilesByIds(obj).toPromise();
            this.contentEditorContentsService.addItemsToCollections(files, content.contentId, true);
          }
          if (content.operation === UpdateOperationWS.DeleteCollectionItems) {
            this.contentEditorContentsService.removeItemsFromCollections(
              content.collectionItemIds,
              content.contentId,
              true,
            );
          }
        }
      });
  }

  updateDocumentCollections() {
    this.signalRService.updateDocumentsCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          // TODO
          if (content.operation === UpdateOperationWS.Transform) {
            this.handleTransform(content.collection, content.collectionItemIds);
          }
          if (content.operation === UpdateOperationWS.Update) {
            const obj: Partial<BaseCollection<BaseFile>> = {
              id: content.contentId,
              name: content.name,
              updatedAt: content.entityTime,
            };
            this.contentEditorContentsService.patchCollectionInfo(obj, true);
            this.updateUI(content.contentId);
          }
          if (content.operation === UpdateOperationWS.AddCollectionItems) {
            const obj: BaseGetNoteFilesByIdsQuery = {
              collectionId: content.contentId,
              noteId: this.noteId,
              fileIds: content.collectionItemIds,
            };
            const files = await this.apiDocuments.getFilesByIds(obj).toPromise();
            this.contentEditorContentsService.addItemsToCollections(files, content.contentId, true);
          }
          if (content.operation === UpdateOperationWS.DeleteCollectionItems) {
            console.log('content: ', content);
            this.contentEditorContentsService.removeItemsFromCollections(
              content.collectionItemIds,
              content.contentId,
              true,
            );
          }
        }
      });
  }

  updatePhotoCollections() {
    this.signalRService.updatePhotosCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          // TODO
          if (content.operation === UpdateOperationWS.Transform) {
            this.handleTransform(content.collection, content.collectionItemIds);
          }
          if (content.operation === UpdateOperationWS.Update) {
            const obj: Partial<PhotosCollection> = {
              id: content.contentId,
              name: content.name,
              updatedAt: content.entityTime,
              width: content.width,
              height: content.height,
              countInRow: content.countInRow,
            };
            this.contentEditorContentsService.patchCollectionInfo(obj, true);
            this.updateUI(content.contentId);
          }
          if (content.operation === UpdateOperationWS.AddCollectionItems) {
            const obj: BaseGetNoteFilesByIdsQuery = {
              collectionId: content.contentId,
              noteId: this.noteId,
              fileIds: content.collectionItemIds,
            };
            const files = await this.apiPhotos.getFilesByIds(obj).toPromise();
            this.contentEditorContentsService.addItemsToCollections(files, content.contentId, true);
          }
          if (content.operation === UpdateOperationWS.DeleteCollectionItems) {
            this.contentEditorContentsService.removeItemsFromCollections(
              content.collectionItemIds,
              content.contentId,
              true,
            );
          }
        }
      });
  }

  updateAudioCollections() {
    this.signalRService.updateAudiosCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          // TODO
          if (content.operation === UpdateOperationWS.Transform) {
            this.handleTransform(content.collection, content.collectionItemIds);
          }
          if (content.operation === UpdateOperationWS.Update) {
            const obj: Partial<BaseCollection<BaseFile>> = {
              id: content.contentId,
              name: content.name,
              updatedAt: content.entityTime,
            };
            this.contentEditorContentsService.patchCollectionInfo(obj, true);
            this.updateUI(content.contentId);
          }
          if (content.operation === UpdateOperationWS.AddCollectionItems) {
            const obj: BaseGetNoteFilesByIdsQuery = {
              collectionId: content.contentId,
              noteId: this.noteId,
              fileIds: content.collectionItemIds,
            };
            const files = await this.apiAudios.getFilesByIds(obj).toPromise();
            this.contentEditorContentsService.addItemsToCollections(files, content.contentId, true);
          }
          if (content.operation === UpdateOperationWS.DeleteCollectionItems) {
            this.contentEditorContentsService.removeItemsFromCollections(
              content.collectionItemIds,
              content.contentId,
              true,
            );
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    throw new Error('Method not implemented.');
  }

  private handleTransform<T extends BaseCollection<BaseFile>>(
    collection: T,
    idsToDelete: string[],
  ) {
    this.contentEditorContentsService.transformTo(collection, idsToDelete);
  }
}
