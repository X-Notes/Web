import { TreeRGA } from './tree-rga';
import {
  LocalDeleteOp,
  DocTreeItem,
  LocalInsertOp,
  LocalTransaction,
  MergeTransaction,
} from './types';

export class TreeOperator<T> {
  tree: TreeRGA<T>;

  agent: number;

  queueTransactions: LocalTransaction<T>[] = [];

  readonly mergeOps = new MergeTransaction<T>();

  constructor(tree: TreeRGA<T>, agent: number) {
    this.tree = tree;
    this.agent = agent;
  }

  read(): string {
    return this.tree.readStr();
  }

  insert(item: T, insertAfter: number): void {
    if (this.agent === 0) {
      throw new Error('Agent cannot be null for this operation');
    }
    const node = new DocTreeItem<T>(item, { agent: this.agent, seq: this.tree.getCounter() });
    const op: LocalInsertOp<T> = { index: insertAfter, node_insert: node };
    const transaction: LocalTransaction<T> = { insert_ops: [op] };

    this.queueTransactions.push(transaction);
  }

  remove(index: number): void {
    if (this.agent === 0) {
      throw new Error('Agent cannot be null for this operation');
    }
    this.tree.getCounter();
    const op: LocalDeleteOp = { index };
    const transaction: LocalTransaction<T> = { delete_ops: [op] };

    this.queueTransactions.push(transaction);
  }

  getNodeByIndex(index: number, nodes: DocTreeItem<T>[]): DocTreeItem<T> {
    if (index >= nodes.length || index < 0) {
      throw Error('Out Array');
    }
    return nodes[index];
  }

  apply(): void {
    const nodes = this.tree.readActiveNodes();
    for (const tx of this.queueTransactions) {
      for (const delOp of tx.delete_ops ?? []) {
        if (delOp.index < 0 || delOp.index >= nodes.length) {
          throw new Error('Outbound array');
        }
        const node = nodes[delOp.index];
        this.tree.removeOne(node);
        this.mergeOps.addRemoveOp(node.id);
      }

      for (const insertOp of tx.insert_ops ?? []) {
        const nodesInsert = this.tree.readActiveNodes();
        const predecessor =
          insertOp.index === 0
            ? this.tree.root
            : this.getNodeByIndex(insertOp.index - 1, nodesInsert);
        this.tree.insertOne(insertOp.node_insert, predecessor);
        this.mergeOps.addInsertOp(
          insertOp.node_insert.content,
          insertOp.node_insert.id,
          predecessor.id,
        );
      }
    }

    this.queueTransactions = [];
  }

  mergeIntoTree(tree: TreeRGA<T>): void {
    tree.merge([this.mergeOps]);
    this.mergeOps.ops = [];
  }
}
