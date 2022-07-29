import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
import { createSnapshotDelay } from 'src/app/core/defaults/bounceDelay';
import { AudiosCollection } from '../../../models/editor-models/audios-collection';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { DocumentsCollection } from '../../../models/editor-models/documents-collection';
import { PhotosCollection } from '../../../models/editor-models/photos-collection';
import { VideosCollection } from '../../../models/editor-models/videos-collection';
import { ContentEditorContentsService } from './content-editor-contents.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { ContentEditorSyncService } from './content-editor-sync.service';

@Injectable()
export class ContentEditorRestoreService {
  private saveSubject: BehaviorSubject<boolean>;

  constructor(
    private contentEditorMomentoStateService: ContentEditorMomentoStateService,
    private contentEditorContentsService: ContentEditorContentsService,
    private contentEditorSyncService: ContentEditorSyncService,
  ) {}

  get content() {
    return this.contentEditorContentsService.getContents;
  }

  init() {
    this.contentEditorMomentoStateService.clear();
    this.contentEditorMomentoStateService.saveToStack(this.content);

    this.destroyAndInitSubject();
    //
    this.saveSubject
      .pipe(
        filter((x) => x === true),
        debounceTime(createSnapshotDelay),
      )
      .subscribe(() => {
        this.contentEditorMomentoStateService.saveToStack(this.content);
      });
  }

  // eslint-disable-next-line class-methods-use-this
  save() {
    this.saveSubject.next(true);
  }

  destroyAndInitSubject() {
    this.saveSubject?.complete();
    this.saveSubject = new BehaviorSubject<boolean>(false);
  }

  // Restore Prev
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restorePrev() {
    if (this.contentEditorMomentoStateService.isEmpty()) {
      return;
    }

    console.log(
      'this.contentEditorMomentoStateService.size(): ',
      this.contentEditorMomentoStateService.size(),
    );
    const prev = this.contentEditorMomentoStateService.getPrev();
    console.log('prev: ', { ...prev });
    if (!this.contentEditorContentsService.isContentsEquals(prev, this.content)) {
      let isNeedChange = false;

      // STRUCTURE
      const [structureDiffs] = this.contentEditorContentsService.getStructureDiffsPrev(prev);
      if (structureDiffs.isAnyChanges()) {
        const removeIds = structureDiffs.removedItems.map((x) => x.id);
        this.contentEditorContentsService.patchStructuralChangesPrev(structureDiffs, removeIds);
        isNeedChange = true;
      }

      // TEXTS
      const textDiffs = this.getCollectionsOrTextInfoDiffs<BaseText>(prev, ContentTypeENUM.Text);
      if (textDiffs && textDiffs.length > 0) {
        this.patchTextDiffs(textDiffs);
        isNeedChange = true;
      }

      // FILES
      const audiosDiffs = this.getCollectionsOrTextInfoDiffs<AudiosCollection>(
        prev,
        ContentTypeENUM.Audios,
      );
      if (audiosDiffs && audiosDiffs.length > 0) {
        this.patchFileContentDiffs(audiosDiffs);
        isNeedChange = true;
      }

      const photosDiffs = this.getCollectionsOrTextInfoDiffs<PhotosCollection>(
        prev,
        ContentTypeENUM.Photos,
      );
      if (photosDiffs && photosDiffs.length > 0) {
        this.patchFileContentDiffs(photosDiffs);
        isNeedChange = true;
      }

      const documentsDiffs = this.getCollectionsOrTextInfoDiffs<DocumentsCollection>(
        prev,
        ContentTypeENUM.Documents,
      );
      if (documentsDiffs && documentsDiffs.length > 0) {
        this.patchFileContentDiffs(documentsDiffs);
        isNeedChange = true;
      }

      const videosDiffs = this.getCollectionsOrTextInfoDiffs<VideosCollection>(
        prev,
        ContentTypeENUM.Videos,
      );
      if (videosDiffs && videosDiffs.length > 0) {
        this.patchFileContentDiffs(videosDiffs);
        isNeedChange = true;
      }

      if (isNeedChange) {
        this.contentEditorSyncService.change();
      }
    }
  }

  private getCollectionsOrTextInfoDiffs<T extends ContentModelBase>(
    prevContent: ContentModelBase[],
    type: ContentTypeENUM,
  ): T[] {
    const oldContents = this.content;
    const newContents = prevContent;
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

  // TEXT
  private patchTextDiffs(texts: BaseText[]) {
    texts.forEach((item) => this.contentEditorContentsService.setSafe(item, item.id));
  }

  // FILES
  private patchFileContentDiffs(contents: ContentModelBase[]) {
    contents.forEach((item) => this.contentEditorContentsService.setSafe(item, item.id));
  }
}
