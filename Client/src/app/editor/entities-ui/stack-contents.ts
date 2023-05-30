import { NoteUpdateIds } from "../entities/structure/note-update-ids";
import { BaseUndoAction } from "./undo/base-undo-action";


export interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  size(): number;
}

export class Stack<T extends BaseUndoAction> implements IStack<T> {
  private storage: T[] = [];

  constructor(private capacity: number = Infinity) {}

  push(item: T): void {
    if (this.size() === this.capacity) {
      throw Error('Stack has reached max capacity, you cannot add more items');
    }
    this.storage.push(item);
  }

  pop(): T | undefined {
    return this.storage.pop();
  }

  peek(): T | undefined {
    return this.storage[this.size() - 1];
  }

  clear(): void {
    this.storage = [];
  }

  size(): number {
    return this.storage.length;
  }

  print(): void {
    console.log(this.storage);
  }

  updateIds(updateIds: NoteUpdateIds[]): void {
    for (const update of updateIds) {
      for (const action of this.storage) {
        const isNeedUpdateId = action.contentId === update.prevId;
        if (isNeedUpdateId) {
          action.contentId = update.id;
        }
      }
    }
  }
}
