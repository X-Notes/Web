/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { BaseText } from '../../../models/editor-models/base-text';
import { Letter } from '../../../models/editor-models/text-models/letter';
import { TextBlock } from '../../../models/editor-models/text-models/text-block';
import { BlockDiff } from '../../content-editor-services/models/block-diff';
import { DiffOperation, LetterDiff } from '../../content-editor-services/models/letter-diff';
import { TextDiff } from '../../content-editor-services/models/text-diff';
import { DiffCheckerService } from '../diffs/diff-checker.service';

@Injectable()
export class CrdtDiffsService {
  constructor(private diffCheckerService: DiffCheckerService) {}

  findChanges(prevTextContent: BaseText, newTextContent: BaseText): TextDiff {
    const diffs: TextDiff = new TextDiff(newTextContent.id);
    if (prevTextContent.headingTypeId !== newTextContent.headingTypeId) {
      diffs.headingTypeId = newTextContent.headingTypeId;
    }
    if (prevTextContent.noteTextTypeId !== newTextContent.noteTextTypeId) {
      diffs.noteTextTypeId = newTextContent.noteTextTypeId;
    }
    if (prevTextContent.checked !== newTextContent.checked) {
      diffs.checked = newTextContent.checked;
    }

    // TODO
    newTextContent.contents ??= [];
    prevTextContent.contents ??= [];

    if (newTextContent.contents.length === 0 && prevTextContent.contents.length === 0) {
      return diffs;
    }

    if (newTextContent.contents.length > prevTextContent.contents.length) {
      const addItemsN = newTextContent.contents.length - prevTextContent.contents.length;
      const arr = [...Array(addItemsN).keys()];
      arr.forEach(() => prevTextContent.contents.push(new TextBlock({})));
    }

    if (newTextContent.contents.length < prevTextContent.contents.length) {
      const addItemsN = prevTextContent.contents.length - newTextContent.contents.length;
      const arr = [...Array(addItemsN).keys()];
      arr.forEach(() => newTextContent.contents.push(new TextBlock({})));
    }

    if (newTextContent.contents.length !== prevTextContent.contents.length) {
      throw new Error('Incorrect length, array should have save length!');
    }

    for (let i = 0; i < newTextContent.contents.length; i++) {
      const uiTextBlock = newTextContent.contents[i];
      const blockToUpdate = prevTextContent.contents[i];
      const changes = this.findChangesBlock(blockToUpdate, uiTextBlock);
      diffs.blockDiffs.push(changes);
    }

    return diffs;
  }

  private findChangesBlock(prevBlock: TextBlock, newBlock: TextBlock): BlockDiff {
    const diffs: BlockDiff = new BlockDiff(prevBlock.id);
    if (prevBlock.highlightColor !== newBlock.highlightColor) {
      diffs.highlightColor = newBlock.highlightColor === null ? 'd' : newBlock.highlightColor;
    }
    if (prevBlock.textColor !== newBlock.textColor) {
      diffs.textColor = newBlock.textColor === null ? 'd' : newBlock.textColor;
    }
    if (prevBlock.link !== newBlock.link) {
      diffs.link = newBlock.link;
    }
    if (!prevBlock.isEqualTextTypes(newBlock.textTypes)) {
      diffs.textTypes = newBlock.textTypes;
    }

    const prevBlockText = prevBlock.getTextOrdered();
    const newBlockText = newBlock.getTextOrdered();
    // console.log('prevBlockText: ', prevBlockText);
    // console.log('newBlockText: ', newBlockText);
    if (prevBlockText !== newBlockText) {
      const letterDiffs = this.diffCheckerService.getDiffs(prevBlockText, newBlockText);
      //console.log('letterDiffs: ', letterDiffs);
      if (letterDiffs?.length > 0) {
        const letterDiffsMapped = letterDiffs.map((x) => new LetterDiff(x[0], x[1]));
        this.processDiffs(diffs, letterDiffsMapped, prevBlock);
      }
    }
    return diffs;
  }

  private processDiffs(blockDiffs: BlockDiff, diffs: LetterDiff[], prevBlock: TextBlock) {
    let currentSameIndex = 0;
    let currentAllIndex = 0;
    // console.log('prevBlock: ', prevBlock);
    // console.log('blockDiffs: ', blockDiffs);
    for (let i = 0; i < diffs.length; i++) {
      const diff = diffs[i];
      const strLength = diff.str?.length;
      if (strLength <= 0) continue;
      for (let j = 0; j < strLength; j++) {
        const letter = diff.str[j];
        switch (diff.operation) {
          case DiffOperation.ADD: {
            const pIndex = currentSameIndex - 1;
            const prevLetter =
              pIndex < prevBlock.lettersOrdered.length ? prevBlock.lettersOrdered[pIndex] : null;
            // console.log('prevLetter: ', prevLetter);
            const nIndex = currentSameIndex;
            const nextLetter =
              nIndex < prevBlock.lettersOrdered.length ? prevBlock.lettersOrdered[nIndex] : null;
            // console.log('nextLetter: ', nextLetter);
            if (!prevLetter && !nextLetter) {
              const newLetter = new Letter(letter, currentAllIndex + 1, null);
              blockDiffs.lettersToAdd.push(newLetter);
            } else {
              const prevFractionalIndex = prevLetter?.fractionalIndex ?? 0;
              const nextFractionalIndex =
                nextLetter?.fractionalIndex ?? prevBlock.lettersOrdered.length + 1;
              const fIndex = (prevFractionalIndex + nextFractionalIndex) / 2;
              const newLetter = new Letter(letter, fIndex, null);
              blockDiffs.lettersToAdd.push(newLetter);
            }
            break;
          }
          case DiffOperation.DELETE: {
            if (currentAllIndex >= 0 && currentAllIndex < prevBlock.lettersOrdered?.length) {
              const letterToDelete = prevBlock.lettersOrdered[currentAllIndex];
              console.log('letterToDelete: ', letterToDelete);
              blockDiffs.letterIdsToDelete.push(letterToDelete.id);
            }
            break;
          }
          case DiffOperation.SAME: {
            currentSameIndex++;
            break;
          }
        }
        currentAllIndex++;
      }
    }
  }
}
