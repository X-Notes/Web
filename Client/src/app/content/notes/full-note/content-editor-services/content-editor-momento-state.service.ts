import { Injectable } from '@angular/core';
import { ContentModelBase } from '../../models/editor-models/content-model-base';
import { Stack } from './models/stack-contents';

@Injectable()
export class ContentEditorMomentoStateService {
  prev: ContentModelBase[];

  private state = new Stack<ContentModelBase[]>();

  save(nState: ContentModelBase[]): void {
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

  print(): void {
    this.state.print();
  }
}
