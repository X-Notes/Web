import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, debounceTime } from 'rxjs/operators';
import { createSnapshotDelay } from 'src/app/core/defaults/bounceDelay';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { ContentEditorContentsService } from './content-editor-contents.service';
import { ContentEditorSyncService } from './content-editor-sync.service';

export interface IsNeedUpdate {
  isNeedUpdate: boolean;
}
@Injectable()
export class ContentEditorRestoreService {
  private saveSubject: BehaviorSubject<boolean>;

  private isEdit = false;

  constructor(
    private contentEditorContentsService: ContentEditorContentsService,
    private contentEditorSyncService: ContentEditorSyncService,
  ) {}

  get contents() {
    return this.contentEditorContentsService.getContents;
  }

  get contentsSync() {
    return this.contentEditorContentsService.getSyncContents;
  }

  initEdit() {
    this.isEdit = true;
    this.destroyAndInitSubject();
    //
    this.saveSubject
      .pipe(
        filter((x) => x === true),
        debounceTime(createSnapshotDelay),
      )
      .subscribe(() => this.contentEditorContentsService.saveToStack());
  }

  // eslint-disable-next-line class-methods-use-this
  save() {
    if (!this.isEdit) return;
    this.saveSubject.next(true);
  }

  destroyAndInitSubject() {
    this.saveSubject?.complete();
    this.saveSubject = new BehaviorSubject<boolean>(false);
  }

  // Restore Prev
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restorePrev() {
    if (this.contentEditorContentsService.isSaveStackEmpty()) {
      return;
    }

    const prev = this.contentEditorContentsService.getPrevFromStack();
    const result: IsNeedUpdate = { isNeedUpdate: false };

    // STRUCTURE
    const [structureDiffs] = this.contentEditorContentsService.getStructureDiffsPrev(prev);
    if (structureDiffs.isAnyChanges()) {
      const removeIds = structureDiffs.removedItems.map((x) => x.id);
      this.contentEditorContentsService.patchStructuralChangesPrev(structureDiffs, removeIds);
      result.isNeedUpdate = true;
    }

    // TEXTS
    const textItems = prev
      .filter((x) => x.typeId === ContentTypeENUM.Text)
      .map((x) => x as BaseText);
    const textDiffs = this.getTextDiffs(textItems);
    if (textDiffs && textDiffs.length > 0) {
      this.patchTextDiffs(textDiffs);
      result.isNeedUpdate = true;
    }

    // FILES
    const collectionItems = prev
      .filter((x) => x.typeId !== ContentTypeENUM.Text)
      .map((x) => x as BaseCollection<BaseFile>);

    this.processCollectionInfos(ContentTypeENUM.Audios, collectionItems, result);
    this.processCollectionItemsDiffs(ContentTypeENUM.Audios, collectionItems, result);

    this.processCollectionInfos(ContentTypeENUM.Photos, collectionItems, result);
    this.processCollectionItemsDiffs(ContentTypeENUM.Photos, collectionItems, result);

    this.processCollectionInfos(ContentTypeENUM.Documents, collectionItems, result);
    this.processCollectionItemsDiffs(ContentTypeENUM.Documents, collectionItems, result);

    this.processCollectionInfos(ContentTypeENUM.Videos, collectionItems, result);
    this.processCollectionItemsDiffs(ContentTypeENUM.Videos, collectionItems, result);

    if (result.isNeedUpdate) {
      this.contentEditorContentsService.clearPrevInStack();
      this.contentEditorSyncService.change();
    }
  }

  private processCollectionInfos(
    type: ContentTypeENUM,
    collectionItems: BaseCollection<BaseFile>[],
    result: IsNeedUpdate,
  ) {
    const contents = this.getCollectionsInfoDiffs(collectionItems, type);
    if (contents && contents.length > 0) {
      this.patchFileContentDiffs(contents);
      result.isNeedUpdate = true;
    }
  }

  private getCollectionsInfoDiffs(
    prevContent: BaseCollection<BaseFile>[],
    type: ContentTypeENUM,
  ): BaseCollection<BaseFile>[] {
    const oldContents = this.contentEditorContentsService.getCollectionContents;
    const newContents = prevContent;
    const contents: BaseCollection<BaseFile>[] = [];
    for (const content of newContents.filter((x) => x.typeId === type)) {
      const isNeedUpdate = oldContents.some(
        (x) => x.typeId === type && x.id === content.id && !content.isEqualCollectionInfo(x),
      );
      if (isNeedUpdate) {
        contents.push(content);
      }
    }
    return contents;
  }

  private processCollectionItemsDiffs(
    type: ContentTypeENUM,
    collectionItems: BaseCollection<BaseFile>[],
    result: IsNeedUpdate,
  ) {
    const contents = this.getCollectionsItemsDiffs(collectionItems, type);
    if (contents && contents.length > 0) {
      this.patchFileContentDiffs(contents);
      result.isNeedUpdate = true;
    }
  }

  private getCollectionsItemsDiffs(
    prevContent: BaseCollection<BaseFile>[],
    type: ContentTypeENUM,
  ): BaseCollection<BaseFile>[] {
    const oldContents = this.contentEditorContentsService.getCollectionContents;
    const newContents = prevContent;
    const contents: BaseCollection<BaseFile>[] = [];
    for (const content of newContents.filter((x) => x.typeId === type)) {
      const isNeedUpdate = oldContents.some(
        (x) =>
          x.typeId === type && x.id === content.id && !content.getIsEqualIdsToAddIdsToRemove(x)[0],
      );
      if (isNeedUpdate) {
        contents.push(content);
      }
    }
    return contents;
  }

  private getTextDiffs(prevContent: BaseText[]): BaseText[] {
    const oldContents = this.contentEditorContentsService.getTextContents;
    const newContents = prevContent;
    const contents: BaseText[] = [];
    for (const content of newContents) {
      const isNeedUpdate = oldContents.some((x) => x.id === content.id && !content.isEqual(x));
      if (isNeedUpdate) {
        contents.push(content);
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
