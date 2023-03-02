import { Injectable } from '@angular/core';
import { Diff, diff_match_patch as DiffMatchPatch, patch_obj } from 'diff-match-patch';
import { DiffOperation, LetterDiff } from '../text/entities/diffs/letter-diff';

@Injectable({
  providedIn: 'root',
})
export class DiffCheckerService {
  dmp = new DiffMatchPatch();

  getPatches(v2: string, v1: string): patch_obj[] {
    return this.dmp.patch_make(v2 ?? '', v1 ?? '');
  }

  getDiffsText(from: string, to: string): Diff[] {
    return this.dmp.diff_main(from ?? '', to ?? '');
  }

  patchApply(diffs: Diff[], str: string): string {
    const patches = this.dmp.patch_make(diffs);
    return this.dmp.patch_apply(patches, str)[0];
  }

  getDiffsTextFormatted(from: string, to: string): LetterDiff[] {
    const letterDiffs = this.getDiffsText(from, to) ?? [];

    const res: LetterDiff[] = [];
    let index = 0;
    let deleteCount = 0;
    let sameCount = 0;
    let addedCount = 0;
    for (const diff of letterDiffs) {
      const op = diff[0];
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      diff[1].split('').forEach((char) => {
        if (op === DiffOperation.DELETE) {
          deleteCount++;
          res.push(new LetterDiff(op, char, index, index - addedCount));
        }
        if (op === DiffOperation.SAME) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          sameCount++;
          res.push(new LetterDiff(op, char, index, index));
        }
        if (op === DiffOperation.ADD) {
          addedCount++;
          res.push(new LetterDiff(op, char, index, index - deleteCount));
        }
        index++;
      });
    }

    return res;
  }
}
