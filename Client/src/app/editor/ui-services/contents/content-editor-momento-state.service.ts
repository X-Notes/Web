import { Injectable } from '@angular/core';
import { Stack } from '../../entities-ui/stack-contents';
import { BaseUndoAction } from '../../entities-ui/undo/base-undo-action';
import { EditorUpdateIds } from '../../entities/structure/editor-update-ids';

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

  updateIds(updateIds: EditorUpdateIds[]): void {
    this.state.updateIds(updateIds);
  }

  print(): void {
    this.state.print();
  }
}
