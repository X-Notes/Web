import { DocTreeItem, MergeTransaction } from './types';

export class TreeRGA<T> {
  root: DocTreeItem<T>;

  seq = 0;

  constructor(init?: { root?: DocTreeItem<T>; seq: number }) {
    if (init?.root) {
      this.root = init.root;
      this.seq = init.seq;
    } else {
      const root = new DocTreeItem<T>(null as T, { agent: 0, seq: 0 });
      root.isRoot = true;
      this.root = root;
    }
  }

  getCounter(): number {
    return ++this.seq;
  }

  clone(): TreeRGA<T> {
    return new TreeRGA({ root: this.root.clone(), seq: this.seq });
  }

  remove(items: DocTreeItem<T>[]): void {
    items.forEach((x) => this.removeOne(x));
  }

  removeOne(item: DocTreeItem<T>): void {
    if (item.isRoot) throw new Error('Root can`t be deleted');
    item.deleted = true;
  }

  insert(updates: { nodeToInsert: DocTreeItem<T>; predecessor: DocTreeItem<T> }[]): void {
    for (const update of updates) {
      this.insertOne(update.nodeToInsert, update.predecessor);
    }
  }

  insertOne(nodesToInsert: DocTreeItem<T>, predecessor: DocTreeItem<T>): void {
    predecessor.insertSimple(nodesToInsert);
  }

  readActiveNodes(): DocTreeItem<T>[] {
    return Array.from(this.getActive());
  }

  read(): T[] {
    return this.readActiveNodes().map((c) => c.content);
  }

  readStr() {
    return this.read().join('');
  }

  merge(transactions: MergeTransaction<T>[]): void {
    for (const tx of transactions) {
      for (const op of tx.ops ?? []) {
        switch (op.type) {
          case 'insert': {
            const nodes = this.getAllNodes();
            const predecessor = nodes.find((x) => x.isEqualId(op.insert_after_node_id));
            const newNode = new DocTreeItem<T>(op.content, op.new_node_id);
            this.insertOne(newNode, predecessor);
            break;
          }
          case 'delete': {
            const nodes = this.getAllNodes();
            const node = nodes.find((x) => x.isEqualId(op.delete_nodeId));
            this.removeOne(node);
            break;
          }
        }
      }
    }
  }

  // READ
  private *getActiveNodes(children: DocTreeItem<T>[]): Generator<DocTreeItem<T>> {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.deleted) yield child;
      yield* this.getActiveNodes(child.children);
    }
  }

  private getChildren(node: DocTreeItem<T>, nodes: DocTreeItem<T>[] = []): DocTreeItem<T>[] {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      nodes.push(child);
      this.getChildren(child, nodes);
    }
    return nodes;
  }

  private getAllNodes(): DocTreeItem<T>[] {
    const nodes = [this.root];
    this.getChildren(this.root, nodes);
    return nodes;
  }

  private *getActive(): Generator<DocTreeItem<T>> {
    yield* this.getActiveNodes(this.root.children);
  }
}
