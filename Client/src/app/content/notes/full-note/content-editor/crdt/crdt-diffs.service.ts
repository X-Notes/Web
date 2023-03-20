/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { BaseText } from '../../../models/editor-models/base-text';
import { ProjectBlock } from '../text/entities/blocks/projection-block';
import { TreeBlock } from '../text/entities/blocks/tree-block';
import { BlockDiff } from '../text/entities/diffs/block-diff';
import { DiffOperation } from '../text/entities/diffs/letter-diff';
import { TreeOperator } from '../text/rga/tree-operator';
import { TreeRGA } from '../text/rga/tree-rga';
import { DiffCheckerService } from './diff-checker.service';

@Injectable()
export class CrdtDiffsService {
  constructor(private diffCheckerService: DiffCheckerService) {}

  getAndApplyBlocksDiffs(baseText: BaseText, uiBlocks: ProjectBlock[], agent: number): BlockDiff[] {
    const diffs: BlockDiff[] = [];

    uiBlocks ??= [];
    baseText.contents ??= [];

    if (uiBlocks.length === 0 && baseText.contents.length === 0) {
      return diffs;
    }

    this.alignBlocks(baseText, uiBlocks);

    for (let i = 0; i < uiBlocks.length; i++) {
      const uiTextBlock = uiBlocks[i];
      const blockToUpdate = baseText.contents[i];
      const changes = this.findChangesBlock(blockToUpdate, uiTextBlock, agent);
      diffs.push(changes);
    }

    return diffs;
  }

  private alignBlocks(baseText: BaseText, uiBlocks: ProjectBlock[]): void {
    if (uiBlocks.length > baseText.contents.length) {
      const addItemsN = uiBlocks.length - baseText.contents.length;
      const arr = [...Array(addItemsN).keys()];
      arr.forEach(() => baseText.contents.push(new TreeBlock({})));
    }

    if (uiBlocks.length < baseText.contents.length) {
      const addItemsN = baseText.contents.length - uiBlocks.length;
      const arr = [...Array(addItemsN).keys()];
      arr.forEach(() => uiBlocks.push(new ProjectBlock({})));
    }

    if (uiBlocks.length !== baseText.contents.length) {
      throw new Error('Incorrect length, array should have save length!');
    }
  }

  private findChangesBlock(treeBlock: TreeBlock, uiBlock: ProjectBlock, agent: number): BlockDiff {
    const diffs: BlockDiff = new BlockDiff();

    if (treeBlock.hc?.value != uiBlock.highlightColor) {
      const value = uiBlock.highlightColor;
      diffs.setHighlightColor(value, agent);
      treeBlock.updateHighlightColor(diffs.highlightColor);
    }

    if (treeBlock.tc?.value != uiBlock.textColor) {
      const value = uiBlock.textColor;
      diffs.setTextColor(value, agent);
      treeBlock.updateTextColor(diffs.textColor);
    }

    if (treeBlock.l?.value != uiBlock.link) {
      const value = uiBlock.link;
      diffs.setLink(value, agent);
      treeBlock.updateLink(diffs.link);
    }

    if (!treeBlock.isEqualTextTypes(uiBlock.textTypes)) {
      const value = uiBlock.textTypes;
      diffs.setTextTypes(value, agent);
      treeBlock.updateTextTypes(diffs.textTypes);
    }

    this.processBlocksTextChanges(treeBlock, uiBlock, diffs, agent);

    return diffs;
  }

  private processBlocksTextChanges(
    treeBlock: TreeBlock,
    uiBlock: ProjectBlock,
    diffs: BlockDiff,
    agent: number,
  ): TreeOperator<string> {
    const operator = this.processTextChanges(treeBlock.tree, uiBlock.getText(), agent);
    operator.apply();
    const changes = operator.mergeOps;
    if (changes?.ops?.length > 0) {
      diffs.mergeOps = changes;
    }
    return operator;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  processTextChanges(
    stateTree: TreeRGA<string>,
    uiText: string,
    agent: number,
  ): TreeOperator<string> {
    const stateText = stateTree.readStr();
    const operator = new TreeOperator(stateTree, agent);
    if (stateText === uiText) return operator;

    const clientDiffs = this.diffCheckerService.getDiffsTextFormatted(stateText, uiText);
    const deleteOps = clientDiffs.filter((x) => x.operation === DiffOperation.DELETE);
    const addOps = clientDiffs.filter((x) => x.operation === DiffOperation.ADD);

    for (const op of deleteOps) {
      operator.remove(op.shiftedIndex);
    }

    for (const op of addOps) {
      operator.insert(op.str, op.shiftedIndex);
    }

    operator.apply();

    return operator;
  }
}
