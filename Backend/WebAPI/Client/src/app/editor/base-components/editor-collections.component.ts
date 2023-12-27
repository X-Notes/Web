import { Component } from '@angular/core';
import { take, filter, takeUntil, tap } from 'rxjs/operators';
import { EditorTitleComponent } from './editor-title.component';
import { TypeUploadFile } from '../entities-ui/files-enums/type-upload-file.enum';
import { TypeUploadFormats } from '../entities-ui/files-enums/type-upload-formats.enum';
import { TransformToFileContent } from '../entities-ui/transform-file-content.model';
import { BaseUndoAction } from '../entities-ui/undo/base-undo-action';
import { RemoveCollectionItemsAction } from '../entities-ui/undo/remove-collection-items-action';
import { RestoreCollectionAction } from '../entities-ui/undo/restore-collection-action';
import { RestoreCollectionItemsAction } from '../entities-ui/undo/restore-collection-items-action';
import { UndoActionTypeEnum } from '../entities-ui/undo/undo-action-type.enum';
import { UploadFileToEntity } from '../entities-ui/upload-files-to-entity';
import { AudiosCollection } from '../entities/contents/audios-collection';
import { BaseCollection } from '../entities/contents/base-collection';
import { BaseFile } from '../entities/contents/base-file';
import { DocumentsCollection } from '../entities/contents/documents-collection';
import { PhotosCollection } from '../entities/contents/photos-collection';
import { VideosCollection } from '../entities/contents/videos-collection';
import { EditorFacadeService } from '../services/editor-facade.service';
import { ofActionDispatched } from '@ngxs/store';
import { ItemToCollectionUploaded } from '../store/editor-actions';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export abstract class EditorCollectionsComponent extends EditorTitleComponent {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(facade: EditorFacadeService) {
    super(facade);
    facade.actions$.pipe(ofActionDispatched(ItemToCollectionUploaded), takeUntilDestroyed())
      .subscribe(x => this.onItemToCollectionUploaded(x))
  }

  // VIDEOS
  deleteVideosCollection(contentId: string) {
    this.handleRestoreCollection(contentId);
    this.facade.videosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteVideoHandler(videoId: string, collection: VideosCollection) {
    this.handleRestoreCollectionItems(videoId, collection);
    this.facade.videosService.deleteVideoHandler(videoId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadVideosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.facade.videosService.uploadVideoToCollectionHandler($event.contentId, $event.files, noteId);
  };

  // DOCUMENTS
  deleteDocumentsCollection(contentId: string) {
    this.handleRestoreCollection(contentId);
    this.facade.documentsService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteDocumentHandler(documentId: string, collection: DocumentsCollection) {
    this.handleRestoreCollectionItems(documentId, collection);
    this.facade.documentsService.deleteDocumentHandler(documentId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadDocumentsToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.facade.documentsService.uploadDocumentToCollectionHandler($event.contentId, $event.files, noteId);
  };

  // AUDIOS
  deleteAudiosCollection(contentId: string) {
    this.handleRestoreCollection(contentId);
    this.facade.audiosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deleteAudioHandler(audioId: string, collection: AudiosCollection) {
    this.handleRestoreCollectionItems(audioId, collection);
    this.facade.audiosService.deleteAudioHandler(audioId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadAudiosToCollectionHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.facade.audiosService.uploadAudioToCollectionHandler($event.contentId, $event.files, noteId);
  };

  onItemToCollectionUploaded(event: ItemToCollectionUploaded): void {
    if (this.options$.getValue().noteId !== event.noteId) {
      return;
    }
    const action = new RemoveCollectionItemsAction([event.itemId], event.contentId);
    this.facade.momentoStateService.saveToStack(action);
    this.syncCollectionItems(event.contentId);
    this.postAction();
  }

  // PHOTOS
  deletePhotosCollection(contentId: string) {
    this.handleRestoreCollection(contentId);
    this.facade.photosService.deleteContentHandler(contentId);
    this.postAction();
  }

  deletePhotoHandler(photoId: string, collection: PhotosCollection) {
    this.handleRestoreCollectionItems(photoId, collection);
    this.facade.photosService.deletePhotoHandler(photoId, collection);
    this.syncCollectionItems(collection.id);
    this.postAction();
  }

  uploadPhotoToAlbumHandler = async ($event: UploadFileToEntity, noteId: string) => {
    await this.facade.photosService.uploadPhotoToCollectionHandler($event.contentId, $event.files, noteId);
  };

  syncCollectionItems(contentId: string): void {
    if (!contentId) return;
    const curEl = this.getCollectionElementById(contentId);
    if (curEl) {
      curEl.syncCollectionItems();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async uploadRandomFiles(files: File[], contentId: string) {
    this.isOverEmpty = false;
    const formats = files.map((x) => `.${x.name.split('.').pop()}`);
    const photosFormats = TypeUploadFormats.photos.split(',');
    const audiosFormats = TypeUploadFormats.audios.split(',');
    const videosFormats = TypeUploadFormats.videos.split(',');
    const documentsFormats = TypeUploadFormats.documents.split(',');

    if (formats.every((q) => photosFormats.some((x) => x === q))) {
      await this.handleRandomPhotosUpload(contentId, files);
    }
    if (formats.every((q) => audiosFormats.some((x) => x === q))) {
      await this.handleRandomAudiosUpload(contentId, files);
    }
    if (formats.every((q) => videosFormats.some((x) => x === q))) {
      await this.handleRandomVideosUpload(contentId, files);
    }
    if (formats.every((q) => documentsFormats.some((x) => x === q))) {
      await this.handleRandomDocumentsUpload(contentId, files);
    }
    this.postAction();
  }

  async handleRandomPhotosUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.facade.photosService.insertNewCollection(
      contentId,
      true,
      PhotosCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        this.handleDeleteCollection(cont.content.id);
        await this.facade.photosService.uploadPhotoToCollectionHandler(cont.content.id, files, this.options$.getValue().noteId);
        this.postAction();
      });
  }

  async handleRandomAudiosUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.facade.audiosService.insertNewCollection(
      contentId,
      true,
      AudiosCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        this.handleDeleteCollection(cont.content.id);
        await this.facade.audiosService.uploadAudioToCollectionHandler(cont.content.id, files, this.options$.getValue().noteId);
        this.postAction();
      });
  }

  async handleRandomVideosUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.facade.videosService.insertNewCollection(
      contentId,
      true,
      VideosCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        this.handleDeleteCollection(cont.content.id);
        await this.facade.videosService.uploadVideoToCollectionHandler(cont.content.id, files, this.options$.getValue().noteId);
        this.postAction();
      });
  }

  async handleRandomDocumentsUpload(contentId: string, files: File[]): Promise<void> {
    const cont = this.facade.documentsService.insertNewCollection(
      contentId,
      true,
      DocumentsCollection.getNew(),
    );
    const prevId = cont.content.id;
    this.facade.contentEditorSyncService.onStructureSync$
      .pipe(
        filter(() => cont.content.prevId === prevId),
        take(1),
      )
      .subscribe(async () => {
        this.handleDeleteCollection(cont.content.id);
        await this.facade.documentsService.uploadDocumentToCollectionHandler(cont.content.id, files, this.options$.getValue().noteId);
        this.postAction();
      });
  }

  // FILE CONTENTS

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    this.facade.selectionService.resetSelectedItems();
    let newContentId: string;
    switch (event.typeFile) {
      case TypeUploadFile.photos: {
        newContentId = await this.facade.photosService.transformToPhotosCollection(
          this.options$.getValue().noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.audios: {
        newContentId = await this.facade.audiosService.transformToAudiosCollection(
          this.options$.getValue().noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.documents: {
        newContentId = await this.facade.documentsService.transformToDocumentsCollection(
          this.options$.getValue().noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.videos: {
        newContentId = await this.facade.videosService.transformToVideosCollection(
          this.options$.getValue().noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      default: {
        throw new Error('incorrect type');
      }
    }

    this.facade.cdr.detectChanges();

    if (newContentId) {
      const el = this.getCollectionElementById(newContentId);
      if (el) {
        el.syncLayoutWithContent();
        el.syncCollectionItems();
      }
      this.handleDeleteCollection(newContentId);
    }
    this.postAction();
  }

  handleDeleteCollection(contentId: string): void {
    const action = new BaseUndoAction(UndoActionTypeEnum.deleteContent, contentId);
    this.facade.momentoStateService.saveToStack(action);
  }

  handleRestoreCollection(contentId: string) {
    const res =
      this.facade.contentsService.getContentAndIndexById<BaseCollection<BaseFile>>(contentId);
    if (res) {
      const action = new RestoreCollectionAction(res.content, res.index);
      this.facade.momentoStateService.saveToStack(action);
    }
  }

  handleRestoreCollectionItems(itemId: string, collection: BaseCollection<BaseFile>): void {
    if (collection.items.length === 1) {
      const index = this.facade.contentsService.getIndexByContentId(collection.id);
      if (index) {
        const action = new RestoreCollectionAction(collection, index);
        this.facade.momentoStateService.saveToStack(action);
      }
      return;
    }
    const items = collection.items.filter((x) => x.fileId === itemId);
    const actionItems = new RestoreCollectionItemsAction(items, collection.id);
    this.facade.momentoStateService.saveToStack(actionItems);
  }
}
