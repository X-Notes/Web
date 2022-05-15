import { Injectable } from '@angular/core';
import { Diff, diff_match_patch as DiffMatchPatch, patch_obj } from 'diff-match-patch';

@Injectable({
  providedIn: 'root',
})
export class DiffCheckerService {
  dmp = new DiffMatchPatch();

  getPatches(v2: string, v1: string): patch_obj[] {
    return this.dmp.patch_make(v2 ?? '', v1 ?? '');
  }

  getDiffs(from: string, to: string): Diff[] {
    return this.dmp.diff_main(from ?? '', to ?? '');
  }

  patchApply(diffs: Diff[], str: string): string {
    const patches = this.dmp.patch_make(diffs);
    return this.dmp.patch_apply(patches, str)[0];
  }
}
