namespace Noots.RGA_CRDT;

public class TreeRGA<T>
{
    public DocTreeItem<T> Root { set; get; }

    public int Seq { set; get; } = 0;

    public TreeRGA(DocTreeItem<T> root = null, int seq = 0)
    {
        if (root != null)
        {
            this.Root = root;
            this.Seq = seq;
        }
        else
        {
            var newRoot = new DocTreeItem<T>(default(T), new NodeId { Agent = 0, Seq = 0 });
            newRoot.IsRoot = true;
            this.Root = newRoot;
        }
    }

    public int GetCounter()
    {
        return ++Seq;
    }

    public TreeRGA<T> Clone()
    {
        return new TreeRGA<T>(Root.Clone(), Seq);
    }

    public void Remove(List<DocTreeItem<T>> items)
    {
        items.ForEach(x => RemoveOne(x));
    }

    public void RemoveOne(DocTreeItem<T> item)
    {
        if (item.IsRoot.HasValue && item.IsRoot.Value)
        {
            throw new Exception("Root can't be deleted");
        }

        item.Deleted = true;
    }

    public void Insert(List<(DocTreeItem<T> nodeToInsert, DocTreeItem<T> predecessor)> updates)
    {
        foreach (var update in updates)
        {
            InsertOne(update.nodeToInsert, update.predecessor);
        }
    }

    public void InsertOne(DocTreeItem<T> nodeToInsert, DocTreeItem<T> predecessor)
    {
        predecessor.InsertSimple(nodeToInsert);
    }

    private void Validate(params MergeTransaction<T>[] transactions)
    {
        var nodes = GetAllNodes();

        foreach (var tx in transactions)
        {
            var ops = tx.Ops ?? new List<MergeOp<T>>();
            foreach (var op in ops)
            {
                switch (op.Type)
                {
                    case MergeOpType.Insert:
                        var isExist = nodes.Any(x => x.IsEqualId(op.NewNodeId));
                        if (isExist)
                        {
                            tx.UnValidOps.Add(op);
                        }
                        else
                        {
                            tx.ValidOps.Add(op);
                        }
                        break;
                    case MergeOpType.Delete:
                        var node = nodes.Find(x => x.IsEqualId(op.DeleteNodeId));
                        if(node == null || node.Deleted)
                        {
                            tx.UnValidOps.Add(op);
                        }
                        else
                        {
                            tx.ValidOps.Add(op);
                        }
                        break;
                }
            }
        }
    }

    public void Merge(params MergeTransaction<T>[] transactions)
    {
        foreach (var tx in transactions)
        {
            Validate(tx);
            LogInvalidTransactions(tx.UnValidOps);
            ProcessOperations(tx.ValidOps);
        }
    }

    private void LogInvalidTransactions(List<MergeOp<T>> ops)
    {
        if (ops == null || ops.Count == 0) return;

        // log
        Console.WriteLine($"INVALID OPS: {ops.Count}");
    }

    private void ProcessOperations(List<MergeOp<T>> ops)
    {
        foreach (var op in ops)
        {
            switch (op.Type)
            {
                case MergeOpType.Insert:
                    var nodes = GetAllNodes();
                    var predecessor = nodes.Find(x => x.IsEqualId(op.InsertAfterNodeId));
                    if(predecessor != null)
                    {
                        var newNode = new DocTreeItem<T>(op.Content, op.NewNodeId);
                        InsertOne(newNode, predecessor);
                    }
                    else
                    {
                        Console.WriteLine("Predecessor not found");
                    }
                    break;
                case MergeOpType.Delete:
                    nodes = GetAllNodes();
                    var node = nodes.Find(x => x.IsEqualId(op.DeleteNodeId));
                    RemoveOne(node);
                    break;
            }

            Seq++;
        }
    }

    public IEnumerable<DocTreeItem<T>> GetActiveNodesLazy(List<DocTreeItem<T>> children) // NEED TO TEST
    {
        foreach (var child in children)
        {
            if (!child.Deleted)
            {
                yield return child;
            }
            foreach (var activeChild in GetActiveNodesLazy(child.Children))
            {
                yield return activeChild;
            }
        }
    }

    private List<DocTreeItem<T>> GetActiveChildren(List<DocTreeItem<T>> children, List<DocTreeItem<T>> nodes = null)
    {
        nodes ??= new List<DocTreeItem<T>>();
        foreach (var child in children)
        {
            if (!child.Deleted)
            {
                nodes.Add(child);
            }
            GetActiveChildren(child.Children, nodes);
        }
        return nodes;
    }

    private List<DocTreeItem<T>> GetChildren(DocTreeItem<T> node, List<DocTreeItem<T>> nodes = null)
    {
        nodes ??= new List<DocTreeItem<T>>();
        foreach (var child in node.Children)
        {
            nodes.Add(child);
            GetChildren(child, nodes);
        }
        return nodes;
    }

    private List<DocTreeItem<T>> GetAllNodes()
    {
        var nodes = new List<DocTreeItem<T>> { Root };
        nodes.AddRange(GetChildren(Root));
        return nodes;
    }

    public List<T> ReadActive()
    {
        var nodes = GetActiveChildren(new List<DocTreeItem<T>> { Root });
        return nodes.Select(c => c.Content).ToList();
    }

    public List<T> ReadActiveLazy()
    {
        return GetActiveNodesLazy(new List<DocTreeItem<T>> { Root }).Select(c => c.Content).ToList();
    }

    public string ReadStr()
    {
        return string.Concat(ReadActive());
    }

    public string ReadStrLazy()
    {
        return string.Concat(ReadActiveLazy());
    }
}
