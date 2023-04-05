import { Injectable } from '@angular/core';
import { NoteUpdateIds } from '../../models/api/notes/note-update-ids';
import { Stack } from '../models/stack-contents';
import { BaseUndoAction } from '../models/undo/base-undo-action';

@Injectable()
export class ContentEditorMomentoStateService {
  private state = new Stack<BaseUndoAction>();

  saveToStack(action: BaseUndoAction): void {
    this.state.push(action);
  }

  getPrev(): BaseUndoAction {
    if (this.state.size() === 0) {
      throw new Error('collection is empty');
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
    this.state.clear();
  }

  updateIds(updateIds: NoteUpdateIds[]): void {
    this.state.updateIds(updateIds);
  }

  print(): void {
    this.state.print();
  }
}
