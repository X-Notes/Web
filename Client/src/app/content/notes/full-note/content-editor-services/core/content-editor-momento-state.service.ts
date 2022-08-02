import { Injectable } from '@angular/core';
import { ContentModelBase } from '../../../models/editor-models/content-model-base';
import { NoteUpdateIds } from '../../models/api/notes/note-update-ids';
import { Stack } from '../models/stack-contents';

@Injectable()
export class ContentEditorMomentoStateService {
  private prev: ContentModelBase[];

  private state = new Stack<ContentModelBase[]>();

  saveToStack(nState: ContentModelBase[]): void {
    if (this.prev) {
      this.state.push(this.prev);
    }
    this.prev = nState.map((a) => a.copy());
  }

  getPrev(): ContentModelBase[] {
    if (this.state.size() === 0) {
      throw new Error('collection is empty');
    }
    if (this.state.size() === 1) {
      return this.state.peek();
    }
    return this.state.pop();
  }

  size(): number {
    return this.state.size();
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  clear(): void {
    this.prev = null;
    this.state.clear();
  }

  updateIds(updateIds: NoteUpdateIds[]): void {
    if (this.prev) {
      for (const update of updateIds) {
        const prevContent = this.prev.find((x) => x.id === update.prevId);
        if (prevContent) {
          prevContent.prevId = update.prevId;
          prevContent.id = update.id;
        }
      }
    }
    this.state.updateIds(updateIds);
  }

  clearPrev(): void {
    this.prev = null;
  }

  print(): void {
    this.state.print();
  }
}
