import { Component } from '@angular/core';
import { take, filter } from 'rxjs/operators';
import { AudiosCollection } from '../../models/editor-models/audios-collection';
import { BaseCollection } from '../../models/editor-models/base-collection';
import { BaseFile } from '../../models/editor-models/base-file';
import { DocumentsCollection } from '../../models/editor-models/documents-collection';
import { PhotosCollection } from '../../models/editor-models/photos-collection';
import { VideosCollection } from '../../models/editor-models/videos-collection';
import { EditorFacadeService } from '../content-editor-services/editor-facade.service';
import { BaseUndoAction } from '../content-editor-services/models/undo/base-undo-action';
import { RemoveCollectionItemsAction } from '../content-editor-services/models/undo/remove-collection-items-action';
import { RestoreCollectionAction } from '../content-editor-services/models/undo/restore-collection-action';
import { RestoreCollectionItemsAction } from '../content-editor-services/models/undo/restore-collection-items-action';
import { UndoActionTypeEnum } from '../content-editor-services/models/undo/undo-action-type.enum';
import { TypeUploadFile } from '../models/enums/type-upload-file.enum';
import { TypeUploadFormats } from '../models/enums/type-upload-formats.enum';
import { TransformToFileContent } from '../models/transform-file-content.model';
import { UploadFileToEntity } from '../models/upload-files-to-entity';
import { EditorTitleComponent } from './editor-title.component';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: '',
  template: '',
})
export class EditorCollectionsComponent extends EditorTitleComponent {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(facade: EditorFacadeService) {
    super(facade);
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
    const videos = await this.facade.videosService.uploadVideosToCollectionHandler($event, noteId);
    const ids = videos.map((x) => x.fileId);
    const action = new RemoveCollectionItemsAction(ids, $event.contentId);
    this.facade.momentoStateService.saveToStack(action);
    this.syncCollectionItems($event.contentId);
    this.postAction();
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
    const docs = await this.facade.documentsService.uploadDocumentsToCollectionHandler(
      $event,
      noteId,
    );
    const ids = docs.map((x) => x.fileId);
    const action = new RemoveCollectionItemsAction(ids, $event.contentId);
    this.facade.momentoStateService.saveToStack(action);
    this.syncCollectionItems($event.contentId);
    this.postAction();
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
    const audios = await this.facade.audiosService.uploadAudiosToCollectionHandler($event, noteId);
    const ids = audios.map((x) => x.fileId);
    const action = new RemoveCollectionItemsAction(ids, $event.contentId);
    this.facade.momentoStateService.saveToStack(action);
    this.syncCollectionItems($event.contentId);
    this.postAction();
  };

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
    const photos = await this.facade.photosService.uploadPhotosToCollectionHandler($event, noteId);
    const ids = photos.map((x) => x.fileId);
    const action = new RemoveCollectionItemsAction(ids, $event.contentId);
    this.facade.momentoStateService.saveToStack(action);
    this.syncCollectionItems($event.contentId);
    this.postAction();
  };

  syncCollectionItems(contentId: string): void {
    if (!contentId) return;
    const curEl = this.getElementById(contentId);
    if (curEl) {
      curEl.syncContentItems();
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
        await this.facade.photosService.uploadPhotosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
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
        await this.facade.audiosService.uploadAudiosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
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
        await this.facade.videosService.uploadVideosToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
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
        await this.facade.documentsService.uploadDocumentsToCollectionHandler(
          { contentId: cont.content.id, files },
          this.noteId,
        );
        this.syncCollectionItems(cont.content.id);
        this.postAction();
      });
  }

  // FILE CONTENTS

  // eslint-disable-next-line class-methods-use-this
  async transformToFileType(event: TransformToFileContent) {
    this.facade.selectionService.resetSelectionItems();
    let newContentId: string;
    switch (event.typeFile) {
      case TypeUploadFile.photos: {
        newContentId = await this.facade.photosService.transformToPhotosCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.audios: {
        newContentId = await this.facade.audiosService.transformToAudiosCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.documents: {
        newContentId = await this.facade.documentsService.transformToDocumentsCollection(
          this.noteId,
          event.contentId,
          event.files,
        );
        break;
      }
      case TypeUploadFile.videos: {
        newContentId = await this.facade.videosService.transformToVideosCollection(
          this.noteId,
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
      const el = this.getElementById(newContentId);
      if (el) {
        el.syncLayoutWithContent(true);
        el.syncContentItems();
      }
      const action = new BaseUndoAction(UndoActionTypeEnum.deleteContent, newContentId);
      this.facade.momentoStateService.saveToStack(action);
    }
    this.postAction();
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
