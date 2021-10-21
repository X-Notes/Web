import { Injectable } from '@angular/core';
import { ContentModel } from '../../models/content-model.model';
import { Stack } from './models/stack-contents';

@Injectable()
export class ContentEditorMomentoStateService {

  private state = new Stack<ContentModel[]>();

  constructor() { }

  prev: ContentModel[];

  save(nState: ContentModel[]): void {
    if(this.prev) {
      this.state.push(this.prev);
    }
    this.prev = nState.map(a => a.copy());
  }

  getPrev(): ContentModel[] {
    if(this.state.size() === 1) {
      return this.state.peek();
    }
    return this.state.pop();
  }

  size(): number {
    return this.state.size();
  }

  print(): void{
    this.state.print();
  }
}
