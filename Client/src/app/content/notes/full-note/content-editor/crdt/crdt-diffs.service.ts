/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { BaseText } from '../../../models/editor-models/base-text';
import { TextDiff } from '../../content-editor-services/models/text-diff';
import { ProjectBlock } from '../text/entities/blocks/projection-block';
import { TreeBlock } from '../text/entities/blocks/tree-block';
import { BlockDiff } from '../text/entities/diffs/block-diff';
import { DiffOperation } from '../text/entities/diffs/letter-diff';
import { TreeOperator } from '../text/rga/tree-operator';
import { DiffCheckerService } from './diff-checker.service';

@Injectable()
export class CrdtDiffsService {
  constructor(private diffCheckerService: DiffCheckerService) {}

  getDiffs(prevTContent: BaseText, newTContent: BaseText, agent: number): TextDiff {
    const diffs: TextDiff = new TextDiff(newTContent.id);
    if (prevTContent.headingTypeId !== newTContent.headingTypeId) {
      diffs.headingTypeId = newTContent.headingTypeId;
    }
    if (prevTContent.noteTextTypeId !== newTContent.noteTextTypeId) {
      diffs.noteTextTypeId = newTContent.noteTextTypeId;
    }
    if (prevTContent.checked !== newTContent.checked) {
      diffs.checked = newTContent.checked;
    }

    diffs.blockDiffs = this.getBlocksDiffs(prevTContent.contents, newTContent.contentsUI, agent);

    return diffs;
  }

  getBlocksDiffs(treeBlocks: TreeBlock[], uiBlocks: ProjectBlock[], agent: number): BlockDiff[] {
    const diffs: BlockDiff[] = [];

    uiBlocks ??= [];
    treeBlocks ??= [];

    if (uiBlocks.length === 0 && treeBlocks.length === 0) {
      return diffs;
    }

    this.alignBlocks(treeBlocks, uiBlocks);

    for (let i = 0; i < uiBlocks.length; i++) {
      const uiTextBlock = uiBlocks[i];
      const blockToUpdate = treeBlocks[i];
      const changes = this.findChangesBlock(blockToUpdate, uiTextBlock, agent);
      diffs.push(changes);
    }

    return diffs;
  }

  private alignBlocks(treeBlocks: TreeBlock[], uiBlocks: ProjectBlock[]): void {
    if (uiBlocks.length > treeBlocks.length) {
      const addItemsN = uiBlocks.length - treeBlocks.length;
      const arr = [...Array(addItemsN).keys()];
      arr.forEach(() => treeBlocks.push(new TreeBlock({})));
    }

    if (uiBlocks.length < treeBlocks.length) {
      const addItemsN = treeBlocks.length - uiBlocks.length;
      const arr = [...Array(addItemsN).keys()];
      arr.forEach(() => uiBlocks.push(new ProjectBlock({})));
    }

    if (uiBlocks.length !== treeBlocks.length) {
      throw new Error('Incorrect length, array should have save length!');
    }
  }

  private findChangesBlock(treeBlock: TreeBlock, uiBlock: ProjectBlock, agent: number): BlockDiff {
    const diffs: BlockDiff = new BlockDiff();

    if (treeBlock.hC?.value !== uiBlock.highlightColor) {
      const value = uiBlock.highlightColor === null ? 'd' : uiBlock.highlightColor;
      diffs.setHighlightColor(value, agent);
    }

    if (treeBlock.tC?.value !== uiBlock.textColor) {
      const value = uiBlock.textColor === null ? 'd' : uiBlock.textColor;
      diffs.setTextColor(value, agent);
    }

    if (treeBlock.l?.value !== uiBlock.link) {
      const value = uiBlock.link;
      diffs.setLink(value, agent);
    }

    if (!treeBlock.isEqualTextTypes(uiBlock.textTypes)) {
      const value = uiBlock.textTypes;
      diffs.setTextTypes(value, agent);
    }

    this.processTextChanges(treeBlock, uiBlock, diffs, agent);

    return diffs;
  }

  private processTextChanges(
    treeBlock: TreeBlock,
    uiBlock: ProjectBlock,
    diffs: BlockDiff,
    agent: number,
  ): void {
    const treeBlockText = treeBlock.getText();
    const uiBlockText = uiBlock.getText();
    if (treeBlockText !== uiBlockText) {
      const clientDiffs = this.diffCheckerService.getDiffsTextFormatted(treeBlockText, uiBlockText);
      const deleteOps = clientDiffs.filter((x) => x.operation === DiffOperation.DELETE);
      const addOps = clientDiffs.filter((x) => x.operation === DiffOperation.ADD);

      const operator = new TreeOperator(treeBlock.tree, agent);

      for (const op of deleteOps) {
        operator.remove(op.shiftedIndex);
      }

      for (const op of addOps) {
        operator.insert(op.str, op.shiftedIndex);
      }

      operator.apply();

      diffs.mergeOps = operator.mergeOps;
      console.log('diffs.mergeOps: ', [...diffs.mergeOps.ops]);
    }
  }
}
