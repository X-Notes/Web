export type Id = { agent: number; seq: number };

export class DocTreeItem<T> {
  content: T;

  id: Id;

  deleted: boolean;

  children: DocTreeItem<T>[]; // always must be sorted seq => agent

  isRoot?: boolean;

  constructor(content: T, id: Id) {
    this.content = content;
    this.id = { agent: id.agent, seq: id.seq };
    this.deleted = false;
    this.children = [];
  }

  isEqualId(id: Id): boolean {
    return id.agent === this.id.agent && id.seq === this.id.seq;
  }

  getNew(): DocTreeItem<T> {
    return new DocTreeItem<T>(this.content, this.id);
  }

  clone(): DocTreeItem<T> {
    const item = new DocTreeItem<T>(this.content, this.id);
    item.deleted = this.deleted;
    item.isRoot = this.isRoot;
    item.children = this.children.map((x) => x.clone());
    return item;
  }

  insertNode(node: DocTreeItem<T>) {
    // TODO
    if (this.children.length === 0) {
      this.children.push(node);
      return;
    }

    const isExistSeqBlock = this.children.some((x) => node.id.seq === x.id.seq);
    if (!isExistSeqBlock) {
      // insert block with 1 node
      return;
    }

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < this.children.length; i++) {
      // can be optimized
      const newNodeSeq = node.id.seq;
      const newNodeAgentId = node.id.agent;
      const el = this.children[i];
      if (newNodeSeq > el.id.seq) {
        this.children.unshift(node);
        break;
      }
      if (el.id.seq === newNodeSeq && newNodeAgentId) {
      }
    }
  }

  insertSimple(node: DocTreeItem<T>): void {
    this.children.push(node);
    this.children.sort(this.sortF);
  }

  sortF(node1: DocTreeItem<T>, node2: DocTreeItem<T>) {
    if (node1.id.seq > node2.id.seq) {
      return -1;
    } else if (node1.id.seq < node2.id.seq) {
      return 1;
    }
    if (node1.id.agent > node2.id.agent) {
      return 1;
    } else if (node1.id.agent < node2.id.agent) {
      return -1;
    } else {
      return 0;
    }
  }
}

export type LocalInsertOp<T> = {
  index: number;
  node_insert: DocTreeItem<T>;
};

export type LocalDeleteOp = {
  index: number;
};

export type LocalTransaction<T> = {
  insert_ops?: LocalInsertOp<T>[];
  delete_ops?: LocalDeleteOp[];
};

export enum MergeOpType {
  Insert = 1,
  Delete
}

export type MergeOp<T> = {
  readonly type: MergeOpType;
  readonly delete_nodeId?: Id;
  readonly insert_after_node_id?: Id;
  readonly content?: T;
  readonly new_node_id?: Id;
};

export class MergeTransaction<T> {
  ops: MergeOp<T>[] = [];

  addInsertOp(content: T, new_node_id: Id, insert_after_node_id: Id): void {
    const mergeOp: MergeOp<T> = {
      type: MergeOpType.Insert,
      content,
      new_node_id,
      insert_after_node_id,
    };
    this.ops.push(mergeOp);
  }

  addRemoveOp(delete_nodeId: Id): void {
    const mergeOp: MergeOp<T> = {
      type: MergeOpType.Delete,
      delete_nodeId,
    };
    this.ops.push(mergeOp);
  }
}
