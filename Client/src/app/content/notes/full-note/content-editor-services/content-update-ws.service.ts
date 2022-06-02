import { Injectable, OnDestroy, QueryList } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseUpdateFileContent } from 'src/app/core/models/signal-r/innerNote/base-update-file-content-ws';
import { UpdatePhotosCollectionWS } from 'src/app/core/models/signal-r/innerNote/update-photos-collection-ws';
import { UpdateNoteTextWS } from 'src/app/core/models/signal-r/innerNote/update-note-text-ws';
import { UpdateOperationWS } from 'src/app/core/models/signal-r/innerNote/update-operation-ws.enum';
import { SignalRService } from 'src/app/core/signal-r.service';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { BaseFile } from '../../models/editor-models/base-file';
import { ContentTypeENUM } from '../../models/editor-models/content-types.enum';
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
          try {
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
          } catch (e) {
            console.error(e);
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
          try {
            this.handleTextUpdates(content);
          } catch (e) {
            console.error(e);
          }
        }
      });
  }

  handleTextUpdates(content: UpdateNoteTextWS) {
    this.contentEditorContentsService.patchText(content.collection, true);
    this.updateUI(content.collection.id);
  }

  updateVideoCollections() {
    this.signalRService.updateVideosCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          try {
            this.handleCollectionTransform(content);
            this.handleUpdateInfoBase(content);
            this.handleInsert(content, ContentTypeENUM.Videos);
            this.handleCollectionDeletion(content);
          } catch (e) {
            console.error(e);
          }
        }
      });
  }

  updateDocumentCollections() {
    this.signalRService.updateDocumentsCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          try {
            this.handleCollectionTransform(content);
            this.handleUpdateInfoBase(content);
            this.handleInsert(content, ContentTypeENUM.Documents);
            this.handleCollectionDeletion(content);
          } catch (e) {
            console.error(e);
          }
        }
      });
  }

  updatePhotoCollections() {
    this.signalRService.updatePhotosCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          try {
            this.handleCollectionTransform(content);
            this.handleUpdateInfoPhotos(content);
            this.handleInsert(content, ContentTypeENUM.Photos);
            this.handleCollectionDeletion(content);
          } catch (e) {
            console.error(e);
          }
        }
      });
  }

  updateAudioCollections() {
    this.signalRService.updateAudiosCollectionEvent$
      .pipe(takeUntil(this.destroy))
      .subscribe(async (content) => {
        if (content) {
          try {
            this.handleCollectionTransform(content);
            this.handleUpdateInfoBase(content);
            this.handleInsert(content, ContentTypeENUM.Audios);
            this.handleCollectionDeletion(content);
          } catch (e) {
            console.error(e);
          }
        }
      });
  }

  handleUpdateInfoPhotos(content: UpdatePhotosCollectionWS): void {
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
  }

  handleUpdateInfoBase(content: BaseUpdateFileContent<BaseCollection<BaseFile>>): void {
    if (content.operation === UpdateOperationWS.Update) {
      const obj: Partial<BaseCollection<BaseFile>> = {
        id: content.contentId,
        name: content.name,
        updatedAt: content.entityTime,
      };
      this.contentEditorContentsService.patchCollectionInfo(obj, true);
      this.updateUI(content.contentId);
    }
  }

  async handleInsert(
    content: BaseUpdateFileContent<BaseCollection<BaseFile>>,
    typeId: ContentTypeENUM,
  ) {
    if (content.operation === UpdateOperationWS.AddCollectionItems) {
      const obj: BaseGetNoteFilesByIdsQuery = {
        collectionId: content.contentId,
        noteId: this.noteId,
        fileIds: content.collectionItemIds,
      };

      let files: BaseFile[];
      switch (typeId) {
        case ContentTypeENUM.Audios: {
          files = await this.apiAudios.getFilesByIds(obj).toPromise();
          break;
        }
        case ContentTypeENUM.Videos: {
          files = await this.apiVideos.getFilesByIds(obj).toPromise();
          break;
        }
        case ContentTypeENUM.Documents: {
          files = await this.apiDocuments.getFilesByIds(obj).toPromise();
          break;
        }
        case ContentTypeENUM.Photos: {
          files = await this.apiPhotos.getFilesByIds(obj).toPromise();
          break;
        }
      }

      if (files && files.length > 0) {
        this.contentEditorContentsService.addItemsToCollections(files, content.contentId, true);
      }
    }
  }

  handleCollectionTransform(content: BaseUpdateFileContent<BaseCollection<BaseFile>>): void {
    if (content.operation === UpdateOperationWS.Transform) {
      this.handleTransform(content.collection, content.collectionItemIds);
    }
  }

  handleCollectionDeletion(content: BaseUpdateFileContent<BaseCollection<BaseFile>>): void {
    if (content.operation === UpdateOperationWS.DeleteCollectionItems) {
      this.contentEditorContentsService.removeItemsFromCollections(
        content.collectionItemIds,
        content.contentId,
        true,
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
    console.log('ng destroy');
  }

  private handleTransform<T extends BaseCollection<BaseFile>>(
    collection: T,
    idsToDelete: string[],
  ) {
    this.contentEditorContentsService.transformTo(collection, idsToDelete);
  }
}
