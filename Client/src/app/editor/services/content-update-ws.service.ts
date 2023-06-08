import { Injectable, QueryList } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignalRService } from 'src/app/core/signal-r.service';
import { DestroyComponentService } from 'src/app/shared/services/destroy-component.service';
import { ApiAudiosService } from '../api/api-audios.service';
import { ApiDocumentsService } from '../api/api-documents.service';
import { ApiPhotosService } from '../api/api-photos.service';
import { ApiVideosService } from '../api/api-videos.service';
import { ParentInteraction, ParentInteractionHTML, ParentInteractionCollection, ComponentType } from '../components/parent-interaction.interface';
import { AudiosCollection, AudioModel } from '../entities/contents/audios-collection';
import { BaseCollection } from '../entities/contents/base-collection';
import { BaseFile } from '../entities/contents/base-file';
import { ContentModelBase } from '../entities/contents/content-model-base';
import { ContentTypeENUM } from '../entities/contents/content-types.enum';
import { DocumentsCollection, DocumentModel } from '../entities/contents/documents-collection';
import { PhotosCollection, Photo } from '../entities/contents/photos-collection';
import { VideosCollection, VideoModel } from '../entities/contents/videos-collection';
import { BaseGetNoteFilesByIdsQuery } from '../entities/files/base-get-note-files-byIds-query';
import { BaseUpdateFileContent } from '../entities/ws/base-update-file-content-ws';
import { UpdateNoteTextWS } from '../entities/ws/update-note-text-ws';
import { UpdateOperationWS } from '../entities/ws/update-operation-ws.enum';
import { UpdatePhotosCollectionWS } from '../entities/ws/update-photos-collection-ws';
import { ContentEditorContentsService } from '../ui-services/contents/content-editor-contents.service';
import { SelectionService } from '../ui-services/selection.service';

@Injectable()
export class ContentUpdateWsService {
  elements: QueryList<ParentInteraction<ContentModelBase>>;

  noteId: string;

  public changes$ = new BehaviorSubject<boolean>(false);

  constructor(
    private signalRService: SignalRService,
    public contentEditorContentsService: ContentEditorContentsService,
    private apiVideos: ApiVideosService,
    private apiAudios: ApiAudiosService,
    private apiDocuments: ApiDocumentsService,
    private apiPhotos: ApiPhotosService,
    private d: DestroyComponentService,
    private selectionService: SelectionService,
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
      .pipe(takeUntil(this.d.d$))
      .subscribe((content) => {
        if (!content) {
          return;
        }
        let changes = false;
        try {
          if (content.contentIdsToDelete && content.contentIdsToDelete.length > 0) {
            this.selectionService.resetSelectionAndItems();
            this.contentEditorContentsService.deleteByIds(content.contentIdsToDelete, true);
            changes = true;
          }
          if (content.positions && content.positions.length > 0) {
            const posIds = content.positions.map(x => x.contentId);
            if(posIds && posIds?.length > 0) {
              this.selectionService.resetSelectionAndItems();
            }
            this.contentEditorContentsService.updatePositions(content.positions, true);
            changes = true;
          }
          if (content.textContentsToAdd) {
            for (const item of content.textContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
              changes = true;
            }
          }
          if (content.photoContentsToAdd) {
            for (const item of content.photoContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
              changes = true;
            }
          }
          if (content.audioContentsToAdd) {
            for (const item of content.audioContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
              changes = true;
            }
          }
          if (content.videoContentsToAdd) {
            for (const item of content.videoContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
              changes = true;
            }
          }
          if (content.documentContentsToAdd) {
            for (const item of content.documentContentsToAdd) {
              this.contentEditorContentsService.insertInto(item, item.order, true);
              changes = true;
            }
          }
          if (changes) {
            this.changes$.next(true);
          }
        } catch (e) {
          console.error(e);
        }
      });
  }

  updateUI(contentId: string) {
    const el = this.elements.toArray().find((x) => x.getContentId() === contentId);
    if (!el) {
      return;
    }
    switch (el.type) {
      case ComponentType.HTML: {
        const htmlEl = el as ParentInteractionHTML;
        htmlEl.updateWS();
        break;
      }
      case ComponentType.Collection: {
        const collectionEl = el as ParentInteractionCollection;
        collectionEl.syncCollectionItems();
        break;
      }
      default: {
        throw new Error('Incorrect type');
      }
    }
    this.changes$.next(true);
  }

  updateText() {
    this.signalRService.updateTextContentEvent$.pipe(takeUntil(this.d.d$)).subscribe((content) => {
      if (content) {
        try {
          const isSelect = this.selectionService.isSelectedAll(content.collection.id);
          if(isSelect) {
            this.selectionService.resetSelectionAndItems();
          }
          this.handleTextUpdates(content);
          this.changes$.next(true);
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
      .pipe(takeUntil(this.d.d$))
      .subscribe(async (content) => {
        if (content) {
          try {
            if (content.operation === UpdateOperationWS.Transform) {
              content.collection = new VideosCollection(content.collection, []);
              this.handleTransform(content.collection, content.collectionItemIds);
              this.updateUI(content.contentId);
            }
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
      .pipe(takeUntil(this.d.d$))
      .subscribe(async (content) => {
        if (content) {
          try {
            if (content.operation === UpdateOperationWS.Transform) {
              content.collection = new DocumentsCollection(content.collection, []);
              this.handleTransform(content.collection, content.collectionItemIds);
              this.updateUI(content.contentId);
            }
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
      .pipe(takeUntil(this.d.d$))
      .subscribe(async (content) => {
        if (content) {
          try {
            if (content.operation === UpdateOperationWS.Transform) {
              content.collection = new PhotosCollection(content.collection, []);
              this.handleTransform(content.collection, content.collectionItemIds);
              this.updateUI(content.contentId);
            }
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
      .pipe(takeUntil(this.d.d$))
      .subscribe(async (content) => {
        if (content) {
          try {
            if (content.operation === UpdateOperationWS.Transform) {
              content.collection = new AudiosCollection(content.collection, []);
              this.handleTransform(content.collection, content.collectionItemIds);
              this.updateUI(content.contentId);
            }
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
        version: content.version
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
        version: content.version
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
          const audiosFiles = await this.apiAudios.getFilesByIds(obj).toPromise();
          files = audiosFiles?.map((x) => new AudioModel(x));
          break;
        }
        case ContentTypeENUM.Videos: {
          const videosFiles = await this.apiVideos.getFilesByIds(obj).toPromise();
          files = videosFiles?.map((x) => new VideoModel(x));
          break;
        }
        case ContentTypeENUM.Documents: {
          const documentsFiles = await this.apiDocuments.getFilesByIds(obj).toPromise();
          files = documentsFiles?.map((x) => new DocumentModel(x));
          break;
        }
        case ContentTypeENUM.Photos: {
          const photosFiles = await this.apiPhotos.getFilesByIds(obj).toPromise();
          files = photosFiles?.map((x) => new Photo(x));
          break;
        }
      }

      if (files && files.length > 0) {
        this.contentEditorContentsService.addItemsToCollections(files, content.contentId, content.entityTime, content.version, true);
      }

      this.updateUI(content.contentId);
    }
  }

  handleCollectionDeletion(content: BaseUpdateFileContent<BaseCollection<BaseFile>>): void {
    if (content.operation === UpdateOperationWS.DeleteCollectionItems) {
      this.contentEditorContentsService.removeItemsFromCollections(
        content.collectionItemIds,
        content.contentId,
        content.entityTime, 
        content.version, 
        true,
      );
      this.updateUI(content.contentId);
    }
  }

  private handleTransform<T extends BaseCollection<BaseFile>>(
    collection: T,
    idsToDelete: string[],
  ) {
    this.contentEditorContentsService.transformTo(collection, idsToDelete);
  }
}
