import { Injectable } from '@angular/core';
import { BaseCollection } from '../../../models/editor-models/base-collection';
import { BaseFile } from '../../../models/editor-models/base-file';
import { BaseText } from '../../../models/editor-models/base-text';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { ContentTypeENUM } from '../../../models/editor-models/content-types.enum';
import { ChangePositionAction } from '../models/undo/change-position-action';
import { MutateCollectionInfoAction } from '../models/undo/mutate-collection-info';
import { MutateRowAction } from '../models/undo/mutate-row-action';
import { RemoveCollectionItemsAction } from '../models/undo/remove-collection-items-action';
import { RestoreCollectionAction } from '../models/undo/restore-collection-action';
import { RestoreCollectionItemsAction } from '../models/undo/restore-collection-items-action';
import { RestoreTextAction } from '../models/undo/restore-text-action';
import { UndoActionTypeEnum } from '../models/undo/undo-action-type.enum';
import { UpdateTextTypeAction } from '../models/undo/update-text-type-action';
import { UpdateTitleAction } from '../models/undo/update-title-action';
import { ContentEditorContentsService } from './content-editor-contents.service';
import { ContentEditorMomentoStateService } from './content-editor-momento-state.service';
import { ContentEditorSyncService } from './content-editor-sync.service';

export interface IsNeedUpdate {
  isNeedUpdate: boolean;
}
@Injectable()
export class ContentEditorRestoreService {
  constructor(
    private contentEditorContentsService: ContentEditorContentsService,
    private contentEditorSyncService: ContentEditorSyncService,
    private ceMomentoStateService: ContentEditorMomentoStateService,
  ) {}

  get contents() {
    return this.contentEditorContentsService.getContents;
  }

  get textContents() {
    return this.contentEditorContentsService.getTextContents;
  }

  get collectionContents() {
    return this.contentEditorContentsService.getCollectionContents;
  }

  get contentsSync() {
    return this.contentEditorContentsService.getSyncContents;
  }

  // Restore Prev
  // eslint-disable-next-line @typescript-eslint/member-ordering
  restorePrev(updateTitle: (title: string) => void): string[] {
    const idsToUpdate: string[] = [];
    const stackEmpty = this.ceMomentoStateService.isEmpty();
    if (stackEmpty) {
      return idsToUpdate;
    }

    console.log('this.ceMomentoStateService: ', this.ceMomentoStateService.size());
    const prev = this.ceMomentoStateService.getPrev();
    console.log('prev: ', prev);
    const result: IsNeedUpdate = { isNeedUpdate: false };

    switch (prev.type) {
      case UndoActionTypeEnum.textMutate: {
        const action = prev as MutateRowAction;
        const content = this.textContents.find((x) => x.id === action.contentId);
        if (content) {
          content.contents = action.textBlocks;
          idsToUpdate.push(content.id);
        }
        break;
      }
      case UndoActionTypeEnum.deleteContent: {
        const contents = this.contents.filter((x) => x.id !== prev.contentId);
        this.contentEditorContentsService.updateContent(contents);
        break;
      }
      case UndoActionTypeEnum.reorder: {
        const action = prev as ChangePositionAction;
        this.contentEditorContentsService.updatePositions(action.positions, false);
        break;
      }
      case UndoActionTypeEnum.mutateTitle: {
        const action = prev as UpdateTitleAction;
        updateTitle(action.title);
        break;
      }
      case UndoActionTypeEnum.mutateTextType: {
        const action = prev as UpdateTextTypeAction;
        const content = this.textContents.find((x) => x.id === action.contentId);
        if (content) {
          if (action.headingTypeId) {
            content.headingTypeId = action.headingTypeId;
          }
          if (action.noteTextTypeId) {
            content.noteTextTypeId = action.noteTextTypeId;
          }
          idsToUpdate.push(content.id);
        }
        break;
      }
      case UndoActionTypeEnum.removeCollectionItems: {
        const action = prev as RemoveCollectionItemsAction;
        const content = this.collectionContents.find((x) => x.id === action.contentId);
        if (content) {
          content.removeItemsFromCollection(action.ids);
        }
        idsToUpdate.push(content.id);
        break;
      }
      case UndoActionTypeEnum.restoreText: {
        const action = prev as RestoreTextAction;
        this.contentEditorContentsService.insertInto(action.text, action.order);
        break;
      }
      case UndoActionTypeEnum.restoreCollection: {
        const action = prev as RestoreCollectionAction;
        this.contentEditorContentsService.insertInto(action.collection, action.order);
        break;
      }
      case UndoActionTypeEnum.restoreCollectionItems: {
        const action = prev as RestoreCollectionItemsAction;
        const content = this.collectionContents.find((x) => x.id === action.contentId);
        if (content) {
          content.addItemsToCollection(action.items);
        }
        idsToUpdate.push(content.id);
        break;
      }
      case UndoActionTypeEnum.mutateCollectionInfo: {
        const action = prev as MutateCollectionInfoAction<BaseCollection<BaseFile>>;
        const content = this.collectionContents.find((x) => x.id === action.contentId);
        if (content) {
          content.updateInfo(action.collection);
        }
        idsToUpdate.push(content.id);
        break;
      }
      default: {
        throw new Error('Incorrect type');
      }
    }

    return idsToUpdate;

    /*
    // STRUCTURE
    const [structureDiffs] = this.contentEditorContentsService.getStructureDiffsPrev(prev);
    console.log('structureDiffs: ', structureDiffs);
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
    */
    console.log('result: ', result);
    if (result.isNeedUpdate) {
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
